"""
DIME Backend — Reranker.

Utilizes a CrossEncoder model to re-score and re-order hybrid candidate pools
for maximum relevance.
"""

import logging

from sentence_transformers import CrossEncoder

from backend.core.config import get_settings
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult

logger = logging.getLogger(__name__)


class CrossEncoderReranker:
    """Reranks candidate lists using a cross-encoder model."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.model_name = self.settings.reranker_model_name
        self.device = self.settings.reranker_device
        self.batch_size = self.settings.reranker_batch_size

        logger.info(f"Initializing CrossEncoder reranker: {self.model_name} on {self.device}")
        try:
            self.model = CrossEncoder(self.model_name, device=self.device)
        except Exception as e:
            logger.error(f"Failed to initialize reranker '{self.model_name}': {e}")
            raise RuntimeError(f"Reranker initialization failed: {e}") from e

    def rerank(
        self, query: RetrievalQuery, candidates: list[RetrievalResult], top_k: int | None = None
    ) -> list[RetrievalResult]:
        """
        Re-score and re-order candidates based on query-document relevance.
        Truncates the final list to `top_k`.
        """
        limit = top_k or query.top_k or self.settings.retrieval_final_top_k

        if not candidates:
            return []

        try:
            # Prepare pairs: (query_text, candidate_text)
            # Empty text falls back to empty string to prevent crashing
            pairs = [(query.query_text, c.text or "") for c in candidates]

            # Generate cross-encoder logits
            scores = self.model.predict(
                pairs, batch_size=self.batch_size, show_progress_bar=False
            )

            # Apply scores to candidates
            for candidate, score in zip(candidates, scores):
                candidate.rerank_score = float(score)
                candidate.final_score = float(score)

            # Sort descending by final_score
            sorted_candidates = sorted(candidates, key=lambda x: x.final_score, reverse=True)
            final_list = sorted_candidates[:limit]
            
            logger.info(f"Reranker yielded top {len(final_list)} results from {len(candidates)} candidates.")
            return final_list

        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            raise RuntimeError(f"Reranking failed: {e}") from e
