"""
DIME Backend — Retrieval Service.

Orchestrates Dense, Sparse, Hybrid, and Reranking components into a unified
E2E retrieval pipeline.
"""

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.core.retrieval.dense import DenseRetriever
from backend.core.retrieval.hybrid import HybridRetriever
from backend.core.retrieval.models import RetrievalQuery, RetrievalResult
from backend.core.retrieval.reranker import CrossEncoderReranker
from backend.core.retrieval.sparse import SparseRetriever
from backend.models.evidence import SourceChunk

logger = logging.getLogger(__name__)


class RetrievalService:
    """End-to-End Retrieval Pipeline orchestrator."""

    def __init__(
        self,
        dense_retriever: DenseRetriever,
        sparse_retriever: SparseRetriever,
        hybrid_retriever: HybridRetriever,
        reranker: CrossEncoderReranker,
    ) -> None:
        self.dense = dense_retriever
        self.sparse = sparse_retriever
        self.hybrid = hybrid_retriever
        self.reranker = reranker

    async def _hydrate_dense_results(
        self, session: AsyncSession, dense_results: list[RetrievalResult]
    ) -> None:
        """Fetch missing text and canonical freshness metadata for dense candidates."""
        chunk_ids = [r.chunk_id for r in dense_results if not r.text]
        if not chunk_ids:
            return

        stmt = (
            select(SourceChunk)
            .options(selectinload(SourceChunk.document))
            .where(SourceChunk.id.in_(chunk_ids))
        )
        res = await session.execute(stmt)
        chunks_map = {chunk.id: chunk for chunk in res.scalars()}

        for r in dense_results:
            if not r.text and r.chunk_id in chunks_map:
                chunk = chunks_map[r.chunk_id]
                r.text = chunk.content
                if chunk.document.retrieved_at:
                    r.retrieved_at = chunk.document.retrieved_at.isoformat()
                if chunk.document.expires_at:
                    r.expires_at = chunk.document.expires_at.isoformat()

    async def retrieve(self, query: RetrievalQuery) -> list[RetrievalResult]:
        """
        Executes Dense/Sparse -> Hybrid -> Reranker flow safely.
        Provides graceful degradation if components fail.
        """
        logger.info(f"Retrieval requested for query: '{query.query_text}'")

        dense_results: list[RetrievalResult] = []
        sparse_results: list[RetrievalResult] = []

        # 1. Dense Retrieval
        try:
            dense_results = await self.dense.retrieve(query)
        except Exception as e:
            logger.error(f"Dense retrieval degraded: {e}")

        # 2. Sparse Retrieval
        try:
            sparse_results = await self.sparse.retrieve(query)
        except Exception as e:
            logger.error(f"Sparse retrieval degraded: {e}")

        # Hydrate Dense candidates (Qdrant lacks text)
        if dense_results:
            try:
                await self._hydrate_dense_results(self.sparse.session, dense_results)
            except Exception as e:
                logger.error(f"Failed to hydrate dense candidates: {e}")

        # 3. Hybrid Fusion
        hybrid_results = self.hybrid.fuse(dense_results, sparse_results)

        # ── Freshness Verification ──────────────────────────────────────────
        # Double-check that candidates are not expired and text actually exists.
        # This protects against Qdrant returning orphaned points before cleanup.
        now = datetime.now(timezone.utc)
        valid_candidates = []

        for c in hybrid_results:
            if not c.text:
                continue
            if c.expires_at:
                try:
                    exp = datetime.fromisoformat(c.expires_at)
                    if exp.tzinfo is None:
                        exp = exp.replace(tzinfo=timezone.utc)
                    if exp <= now:
                        logger.debug(f"Discarding expired candidate: {c.chunk_id}")
                        continue
                except ValueError:
                    pass
            valid_candidates.append(c)

        if not valid_candidates:
            logger.info("No valid candidates found for query.")
            return []

        # 4. Reranking
        try:
            final_results = self.reranker.rerank(query, valid_candidates)
            return final_results
        except Exception as e:
            logger.error(f"Reranking degraded, returning hybrid fusion baseline: {e}")
            # Graceful degradation: return hybrid ordered list truncated to top_k
            limit = query.top_k or self.reranker.settings.retrieval_final_top_k
            return valid_candidates[:limit]
