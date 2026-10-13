"""
Document Intelligence Pipeline.
Transforms heterogeneous provider records into canonical, deduplicated, 
chunked, and temporally bounded Shared Intelligence Entities.
"""

import datetime
import hashlib
import logging
from typing import Any

from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import get_settings
from backend.ingestion.chunker import DocumentChunker
from backend.ingestion.normalizer import TextNormalizer
from backend.models.evidence import SourceChunk, SourceDocument
from backend.schemas.source import SourceDocument as PydanticSourceDocument

logger = logging.getLogger(__name__)


class DocumentPipeline:
    """
    Processes incoming Pydantic documents and persists them as canonical,
    deduplicated PostgreSQL Shared Intelligence Entities.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.normalizer = TextNormalizer()
        self.chunker = DocumentChunker()

    def _determine_canonical_identity(self, doc: PydanticSourceDocument) -> tuple[str, str]:
        """
        Determines the canonical identity (source, source_id) for deduplication.
        Strongest identifiers first.
        """
        metadata = doc.metadata or {}
        
        # 1. DOI for Research Papers
        doi = metadata.get("doi")
        if doi:
            # Normalize DOI formatting to lowercase
            return "doi", str(doi).strip().lower()
            
        # 2. Canonical URL for Web Pages
        # Prefer canonical URL if available, fallback to the provided URL, then original_url metadata
        url = metadata.get("canonical_url") or doc.url or metadata.get("original_url")
        if doc.source == "web" and url:
            return "web", url.strip()
            
        # 3. Fallback to provided source and source_id (e.g. github + repo_id)
        return doc.source, doc.source_id

    def _hash_content(self, title: str, text: str) -> str:
        """
        Calculates a deterministic hash for versioning.
        Only title and text dictate the content version, not metadata.
        """
        payload = f"{title}\n\n{text}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _prepare_metadata(self, doc: PydanticSourceDocument) -> dict[str, Any]:
        """
        Enriches deterministic metadata.
        Preserves provenance.
        """
        meta = doc.metadata.copy() if doc.metadata else {}
        meta["original_source"] = doc.source
        meta["original_source_id"] = doc.source_id
        
        # Merge authors safely
        if not meta.get("authors") and hasattr(doc, "authors"):
            meta["authors"] = getattr(doc, "authors")
            
        return meta

    async def process(self, session: AsyncSession, doc: PydanticSourceDocument) -> str | None:
        """
        Process a single document through the pipeline.
        Returns the UUID of the resulting SourceDocument.
        """
        try:
            # 1. Text Normalization
            normalized_text = self.normalizer.normalize_text(doc.text)
            
            # 2. Canonical Identity
            canonical_source, canonical_source_id = self._determine_canonical_identity(doc)
            
            # 3. Content Hashing
            content_hash = self._hash_content(doc.title, normalized_text)
            
            # 4. Temporal Bounds
            expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
                hours=self.settings.document_ttl_hours
            )
            
            metadata = self._prepare_metadata(doc)
            
            # 5. Upsert Document using PostgreSQL ON CONFLICT
            # This securely avoids race conditions when multiple analyses fetch the same paper.
            insert_stmt = insert(SourceDocument).values(
                source=canonical_source,
                source_id=canonical_source_id,
                source_type=doc.entity_type,
                source_url=doc.url,
                title=doc.title,
                content=normalized_text,
                content_hash=content_hash,
                language="en",
                published_at=doc.published_at,
                retrieved_at=doc.retrieved_at,
                expires_at=expires_at,
                status="normalized",
                metadata_=metadata
            )
            
            # If it already exists, update content, hash, expiration, and merge metadata if desired.
            # For V1, we overwrite with the latest retrieval to ensure freshness.
            upsert_stmt = insert_stmt.on_conflict_do_update(
                index_elements=["source", "source_id"],
                set_=dict(
                    title=insert_stmt.excluded.title,
                    content=insert_stmt.excluded.content,
                    content_hash=insert_stmt.excluded.content_hash,
                    source_url=insert_stmt.excluded.source_url,
                    published_at=insert_stmt.excluded.published_at,
                    retrieved_at=insert_stmt.excluded.retrieved_at,
                    expires_at=insert_stmt.excluded.expires_at,
                    status=insert_stmt.excluded.status,
                    metadata=insert_stmt.excluded["metadata"],
                )
            ).returning(SourceDocument.id, SourceDocument.content_hash)
            
            result = await session.execute(upsert_stmt)
            row = result.fetchone()
            
            if not row:
                logger.error(f"Failed to upsert document {canonical_source}:{canonical_source_id}")
                return None
                
            db_doc_id, db_hash = row[0], row[1]
            
            # 6. Chunking
            # We must chunk if this is a new document or if the content has changed.
            # Since we just updated the row, we need to check if the old chunks match the new hash.
            # A simple deterministic approach: delete old chunks that do NOT match the new hash,
            # and insert new chunks if they don't already exist for this hash.
            
            # Delete stale chunks for this document
            delete_chunks_stmt = delete(SourceChunk).where(
                SourceChunk.document_id == db_doc_id,
                SourceChunk.content_hash != content_hash
            )
            await session.execute(delete_chunks_stmt)
            
            # Generate and upsert new chunks
            chunks = self.chunker.chunk_text(normalized_text)
            
            if chunks:
                chunk_values = []
                for idx, chunk_text in enumerate(chunks):
                    chunk_values.append({
                        "document_id": db_doc_id,
                        "chunk_index": idx,
                        "content": chunk_text,
                        "content_hash": content_hash
                    })
                
                # Insert chunks safely (ignoring duplicates if they already exist for this hash)
                chunk_insert_stmt = insert(SourceChunk).values(chunk_values)
                chunk_insert_stmt = chunk_insert_stmt.on_conflict_do_nothing(
                    index_elements=["document_id", "content_hash", "chunk_index"]
                )
                await session.execute(chunk_insert_stmt)
                
            # Update status to chunked
            # (We could do this in an UPDATE statement, but we'll trust the flow for now)
            
            await session.commit()
            return str(db_doc_id)

        except Exception as e:
            await session.rollback()
            logger.exception(f"Error in DocumentPipeline: {e}")
            return None

    async def process_batch(self, session: AsyncSession, docs: list[PydanticSourceDocument]) -> list[str]:
        """
        Process a batch of documents sequentially within the same transactional context.
        Returns a list of successfully processed document UUIDs.
        """
        from backend.worker.tasks import embed_and_store_document_task
        
        results = []
        for doc in docs:
            doc_id = await self.process(session, doc)
            if doc_id:
                results.append(doc_id)
                try:
                    embed_and_store_document_task.delay(doc_id)
                except Exception as e:
                    logger.error(f"Failed to queue embedding task for document {doc_id}: {e}")
        return results
