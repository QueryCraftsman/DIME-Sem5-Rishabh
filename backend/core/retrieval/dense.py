"""
DIME Backend — Dense Retrieval.

Performs vector searches against Qdrant using the configured EmbeddingProvider.
"""

import logging

from qdrant_client.http import models

from backend.core.config import get_settings
from backend.core.embeddings import EmbeddingProvider
from backend.core.qdrant import QdrantStore
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult

logger = logging.getLogger(__name__)


class DenseRetriever:
    """Retrieves candidates from Qdrant via semantic similarity."""

    def __init__(self, embedding_provider: EmbeddingProvider, qdrant_store: QdrantStore) -> None:
        self.settings = get_settings()
        self.embedding_provider = embedding_provider
        self.qdrant_store = qdrant_store

    def _build_filter(self, query: RetrievalQuery) -> models.Filter | None:
        """Build Qdrant metadata filters."""
        must_conditions = []

        if query.source:
            must_conditions.append(
                models.FieldCondition(
                    key="source", match=models.MatchAny(any=query.source)
                )
            )
            
        # Qdrant payloads from Phase 7 don't include entity_type (source_type), 
        # so we will rely on Postgres hydration/filtering for missing constraints later.

        if not must_conditions:
            return None

        return models.Filter(must=must_conditions)

    async def retrieve(
        self, query: RetrievalQuery, top_k: int | None = None
    ) -> list[RetrievalResult]:
        """Perform vector search in Qdrant."""
        limit = top_k or query.top_k or self.settings.retrieval_dense_top_k

        try:
            # Embed the query
            vector = self.embedding_provider.embed(query.query_text)
            
            # Fetch from Qdrant
            search_filter = self._build_filter(query)
            
            search_result = await self.qdrant_store.client.query_points(  # type: ignore
                collection_name=self.qdrant_store.collection_name,
                query=vector,
                limit=limit,
                query_filter=search_filter,
                with_payload=True
            )

            results = []
            for hit in search_result.points:
                payload = hit.payload or {}
                
                results.append(
                    RetrievalResult(
                        chunk_id=payload.get("chunk_id", ""),
                        document_id=payload.get("document_id", ""),
                        text="",  # Hydrated later in Service
                        source=payload.get("source", ""),
                        source_id=payload.get("source_id", ""),
                        title=payload.get("title", ""),
                        canonical_url=payload.get("canonical_url"),
                        dense_score=hit.score,
                        content_hash=payload.get("content_hash", ""),
                        retrieved_at=payload.get("retrieved_at"),
                        expires_at=payload.get("expires_at"),
                    )
                )
            
            logger.info(f"Dense retrieval yielded {len(results)} candidates.")
            return results

        except Exception as e:
            logger.error(f"Dense retrieval failed: {e}")
            raise RuntimeError(f"Dense retrieval failed: {e}") from e
