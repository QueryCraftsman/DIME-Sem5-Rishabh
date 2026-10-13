"""
DIME Backend — Sparse Retrieval.

Performs lexical retrieval using PostgreSQL Full Text Search (FTS).
Respects Document TTL constraints strictly.
"""

import datetime
import logging

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.core.config import get_settings
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult
from backend.models.evidence import SourceChunk, SourceDocument

logger = logging.getLogger(__name__)


class SparseRetriever:
    """Retrieves candidates using PostgreSQL Full Text Search (BM25-like lexical matching)."""

    def __init__(self, session: AsyncSession) -> None:
        self.settings = get_settings()
        self.session = session

    async def retrieve(
        self, query: RetrievalQuery, top_k: int | None = None
    ) -> list[RetrievalResult]:
        """Perform lexical FTS in PostgreSQL."""
        limit = top_k or query.top_k or self.settings.retrieval_sparse_top_k
        now = datetime.datetime.now(datetime.timezone.utc)

        try:
            # We use 'english' configuration for websearch_to_tsquery and to_tsvector.
            # This matches the GIN index created in Phase 8 Alembic migration.
            tsquery = func.websearch_to_tsquery("english", query.query_text)
            tsvector = func.to_tsvector("english", SourceChunk.content)

            # Rank score
            rank = func.ts_rank_cd(tsvector, tsquery).label("rank")

            # Base query statement
            stmt = (
                select(SourceChunk, rank)
                .join(SourceDocument)
                .where(
                    tsvector.op("@@")(tsquery),
                    SourceDocument.expires_at > now,  # TTL Freshness Constraint
                )
            )

            # ── Metadata Filters ─────────────────────────────────────
            if query.source:
                stmt = stmt.where(SourceDocument.source.in_(query.source))

            if query.source_type:
                stmt = stmt.where(SourceDocument.source_type.in_(query.source_type))

            if query.published_after:
                try:
                    dt = datetime.datetime.fromisoformat(query.published_after)
                    # Convert naive datetimes to UTC if needed, or assume UTC format.
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=datetime.timezone.utc)
                    stmt = stmt.where(SourceDocument.published_at >= dt)
                except ValueError:
                    logger.warning(f"Invalid published_after date format: {query.published_after}")

            # Order by score and limit
            stmt = (
                stmt.order_by(desc("rank"))
                .limit(limit)
                .options(selectinload(SourceChunk.document))
            )

            result = await self.session.execute(stmt)
            rows = result.all()

            results = []
            for chunk, score in rows:
                results.append(
                    RetrievalResult(
                        chunk_id=chunk.id,
                        document_id=chunk.document_id,
                        text=chunk.content,
                        source=chunk.document.source,
                        source_id=chunk.document.source_id,
                        title=chunk.document.title,
                        canonical_url=chunk.document.source_url,
                        sparse_score=float(score),
                        content_hash=chunk.content_hash,
                        retrieved_at=chunk.document.retrieved_at.isoformat()
                        if chunk.document.retrieved_at
                        else None,
                        expires_at=chunk.document.expires_at.isoformat()
                        if chunk.document.expires_at
                        else None,
                    )
                )

            logger.info(f"Sparse retrieval yielded {len(results)} candidates.")
            return results

        except Exception as e:
            logger.error(f"Sparse retrieval failed: {e}")
            raise RuntimeError(f"Sparse retrieval failed: {e}") from e
