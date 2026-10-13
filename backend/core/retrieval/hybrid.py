"""
DIME Backend — Hybrid Retriever.

Fuses candidates from multiple retrievers using Reciprocal Rank Fusion (RRF).
Deduplicates chunks seamlessly and bounds the hybrid pool size.
"""

import logging

from backend.core.config import get_settings
from backend.core.retrieval.models import RetrievalResult

logger = logging.getLogger(__name__)


class HybridRetriever:
    """Combines candidate lists deterministically via RRF."""

    def __init__(self, rrf_k: int = 60) -> None:
        self.settings = get_settings()
        self.rrf_k = rrf_k

    def fuse(
        self,
        dense_results: list[RetrievalResult],
        sparse_results: list[RetrievalResult],
        limit: int | None = None,
    ) -> list[RetrievalResult]:
        """
        Merge lists using Reciprocal Rank Fusion (RRF).
        Hydrates text missing from Qdrant payloads with text from PostgreSQL.
        """
        limit = limit or self.settings.retrieval_hybrid_limit
        scores: dict[str, float] = {}
        unified_results: dict[str, RetrievalResult] = {}

        def apply_rrf(results: list[RetrievalResult], retrieval_type: str) -> None:
            for rank, result in enumerate(results, start=1):
                chunk_id = result.chunk_id

                if chunk_id not in unified_results:
                    unified_results[chunk_id] = result
                    scores[chunk_id] = 0.0
                else:
                    # Update scores and text if the chunk was found by both
                    existing = unified_results[chunk_id]
                    if retrieval_type == "sparse" and result.text:
                        existing.text = result.text
                        existing.sparse_score = result.sparse_score
                    if retrieval_type == "dense" and result.dense_score is not None:
                        existing.dense_score = result.dense_score

                # RRF Formula
                scores[chunk_id] += 1.0 / (self.rrf_k + rank)

        # Apply RRF for both sets
        apply_rrf(dense_results, "dense")
        apply_rrf(sparse_results, "sparse")

        # Assign calculated hybrid scores
        for chunk_id, result in unified_results.items():
            result.hybrid_score = scores[chunk_id]

        # Sort descending by hybrid_score
        sorted_results = sorted(
            unified_results.values(), key=lambda x: x.hybrid_score or 0.0, reverse=True
        )

        final_list = sorted_results[:limit]
        logger.info(f"Hybrid fusion produced {len(final_list)} unique bounded candidates.")
        return final_list
