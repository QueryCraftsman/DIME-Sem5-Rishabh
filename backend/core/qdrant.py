"""
DIME Backend — Qdrant Vector Store.

Provides the storage abstraction for Qdrant, handling collection setup,
bounded upserts, and deletion of vectors based on PostgreSQL expiration.
"""

import logging
from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models

from backend.core.config import get_settings

logger = logging.getLogger(__name__)


class QdrantStore:
    """Manages Phase 7 vector storage in Qdrant."""

    def __init__(self, dimension: int) -> None:
        self.settings = get_settings()
        self.client = AsyncQdrantClient(
            url=self.settings.qdrant_url,
            api_key=self.settings.qdrant_api_key or None,
            timeout=30,
            check_compatibility=False,
        )
        self.collection_name = self.settings.qdrant_collection_name
        self.dimension = dimension

    async def ensure_collection(self) -> None:
        """Initialize the Qdrant collection if it does not exist."""
        try:
            if not await self.client.collection_exists(self.collection_name):
                logger.info(f"Creating Qdrant collection '{self.collection_name}' (dim={self.dimension})")
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.dimension,
                        distance=models.Distance.COSINE,
                    ),
                )
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant collection '{self.collection_name}': {e}")
            raise RuntimeError(f"Qdrant collection setup failed: {e}") from e

    async def upsert_chunks(
        self, point_ids: list[str], vectors: list[list[float]], payloads: list[dict[str, Any]]
    ) -> None:
        """Idempotently upsert points into Qdrant."""
        if not point_ids:
            return

        if not (len(point_ids) == len(vectors) == len(payloads)):
            raise ValueError("Lengths of point_ids, vectors, and payloads must match.")

        points = [
            models.PointStruct(id=pid, vector=vec, payload=pay)
            for pid, vec, pay in zip(point_ids, vectors, payloads)
        ]

        try:
            await self.client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
        except Exception as e:
            logger.error(f"Failed to upsert {len(points)} points to Qdrant: {e}")
            raise RuntimeError(f"Qdrant upsert failed: {e}") from e

    async def delete_by_document(self, document_id: str) -> None:
        """
        Delete all points associated with a document_id.
        Used by the Phase 6 cleanup task to prevent orphaned vectors.
        """
        try:
            await self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id),
                        )
                    ]
                ),
            )
            logger.info(f"Deleted Qdrant vectors for document_id '{document_id}'")
        except Exception as e:
            logger.error(f"Failed to delete Qdrant vectors for document_id '{document_id}': {e}")
            raise RuntimeError(f"Qdrant deletion failed: {e}") from e
