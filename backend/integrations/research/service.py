"""
Research Service Layer — Pipeline Overhaul.

Orchestrates Semantic Scholar, Crossref, and IEEE with:
  Multi-query retrieval → Candidate collection → Deduplication →
  Relevance scoring → Dynamic selection

Replaces the old "1 query, limit=10" approach.
"""

import asyncio
import logging
import time
from typing import Any

from backend.core.config import get_settings
from backend.core.relevance import score_paper_candidate, PAPER_MIN_RELEVANCE
from backend.agents.models import (
    StructuredIdea,
    SourceQuery,
    CandidateRelevance,
    RetrievalDiagnostics,
)
from backend.schemas.research import ResearchSearchResult
from backend.schemas.source import SourceDocument

from backend.integrations.research.semantic_scholar_client import SemanticScholarClient
from backend.integrations.research.semantic_scholar_adapter import SemanticScholarAdapter
from backend.integrations.research.crossref_client import CrossrefClient
from backend.integrations.research.crossref_adapter import CrossrefAdapter
from backend.integrations.research.ieee_client import IEEEXploreClient
from backend.integrations.research.ieee_adapter import IEEEXploreAdapter

logger = logging.getLogger(__name__)


class ResearchService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _generate_fallback_queries(self, idea: str) -> list[str]:
        """Legacy fallback: extract keywords from idea title."""
        words = [w for w in idea.split() if len(w) > 4]
        exact_query = " ".join(words[:6])
        if not exact_query:
            exact_query = idea[:50]
        return [exact_query]

    def deduplicate(self, documents: list[SourceDocument]) -> list[SourceDocument]:
        """Deduplicate by DOI (primary) then title (secondary)."""
        seen_dois: set[str] = set()
        seen_titles: set[str] = set()
        deduped: list[SourceDocument] = []

        for doc in documents:
            doi = doc.metadata.get("externalIds", {}).get("DOI") or doc.metadata.get("doi")
            if not doi and doc.source == "crossref":
                doi = doc.source_id

            if doi:
                doi = str(doi).lower().strip()
                if doi in seen_dois:
                    continue
                seen_dois.add(doi)

            title = (doc.title or "").lower().strip()
            if title:
                if title in seen_titles:
                    continue
                seen_titles.add(title)

            deduped.append(doc)

        return deduped

    async def acquire_evidence(
        self,
        idea: str,
        structured_idea: StructuredIdea | None = None,
        source_queries: list[SourceQuery] | None = None,
    ) -> tuple[ResearchSearchResult, dict[str, RetrievalDiagnostics]]:
        """
        Full research retrieval pipeline:
        1. Multi-query search across all research providers
        2. Normalize to SourceDocument
        3. Deduplicate by DOI/title
        4. Score relevance
        5. Select by dynamic threshold
        """
        start_time = time.time()

        # Build query list
        if source_queries:
            queries = [sq.query for sq in sorted(source_queries, key=lambda q: q.priority, reverse=True)]
        else:
            queries = self._generate_fallback_queries(idea)

        documents: list[SourceDocument] = []
        providers_used: list[str] = []
        partial = False

        # Per-source diagnostics
        s2_diag = RetrievalDiagnostics(source="semantic_scholar", queries_used=len(queries))
        cr_diag = RetrievalDiagnostics(source="crossref", queries_used=len(queries))
        ieee_diag = RetrievalDiagnostics(source="ieee_xplore", queries_used=len(queries))

        # ── Semantic Scholar: Multiple queries, larger limit ───────
        async def fetch_semantic_scholar() -> list[SourceDocument]:
            try:
                all_papers: list[dict[str, Any]] = []
                seen_ids: set[str] = set()
                async with SemanticScholarClient() as client:
                    for q in queries[:4]:  # Use up to 4 queries
                        try:
                            results = await client.search_papers(q, limit=20)
                            for paper in results:
                                pid = paper.get("paperId", "")
                                if pid and pid not in seen_ids:
                                    seen_ids.add(pid)
                                    paper["_query_used"] = q
                                    all_papers.append(paper)
                        except Exception as e:
                            logger.warning(f"S2 query '{q}' failed: {e}")
                s2_diag.raw_candidates = len(all_papers)
                return [SemanticScholarAdapter.normalize_paper(p) for p in all_papers]
            except Exception as e:
                logger.warning(f"Semantic Scholar integration failed: {e}")
                return []

        # ── Crossref: Multiple queries ────────────────────────────
        async def fetch_crossref() -> list[SourceDocument]:
            try:
                all_works: list[dict[str, Any]] = []
                seen_dois: set[str] = set()
                async with CrossrefClient() as client:
                    for q in queries[:3]:
                        try:
                            results = await client.search_works(q)
                            for work in results:
                                doi = work.get("DOI", "")
                                if doi and doi not in seen_dois:
                                    seen_dois.add(doi)
                                    work["_query_used"] = q
                                    all_works.append(work)
                        except Exception as e:
                            logger.warning(f"Crossref query '{q}' failed: {e}")
                cr_diag.raw_candidates = len(all_works)
                return [CrossrefAdapter.normalize_work(w) for w in all_works]
            except Exception as e:
                logger.warning(f"Crossref integration failed: {e}")
                return []

        # ── IEEE: Single query (typically limited API) ────────────
        async def fetch_ieee() -> list[SourceDocument]:
            try:
                async with IEEEXploreClient() as client:
                    results = await client.search_articles(queries[0] if queries else idea[:50])
                    ieee_diag.raw_candidates = len(results)
                    return [IEEEXploreAdapter.normalize_article(a) for a in results]
            except Exception as e:
                logger.warning(f"IEEE Xplore integration failed: {e}")
                return []

        # Run all concurrently
        tasks = [fetch_semantic_scholar(), fetch_crossref(), fetch_ieee()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        provider_names = ["semantic_scholar", "crossref", "ieee_xplore"]

        for i, res in enumerate(results):
            if isinstance(res, list):
                if len(res) > 0:
                    providers_used.append(provider_names[i])
                documents.extend(res)
            elif isinstance(res, Exception):
                partial = True
                logger.error(f"Task {provider_names[i]} raised exception: {res}")

        # ── Deduplication ─────────────────────────────────────────
        raw_count = len(documents)
        deduped_docs = self.deduplicate(documents)

        s2_deduped = [d for d in deduped_docs if d.source == "semantic_scholar"]
        cr_deduped = [d for d in deduped_docs if d.source == "crossref"]
        ieee_deduped = [d for d in deduped_docs if d.source == "ieee_xplore"]

        s2_diag.after_dedup = len(s2_deduped)
        cr_diag.after_dedup = len(cr_deduped)
        ieee_diag.after_dedup = len(ieee_deduped)

        # ── Relevance Scoring ─────────────────────────────────────
        if structured_idea:
            scored_papers: list[tuple[float, SourceDocument]] = []
            selected_docs: list[SourceDocument] = []
            for doc in deduped_docs:
                paper_data = {
                    "title": doc.title,
                    "abstract": doc.text[:2000] if doc.text else "",
                    "url": doc.url,
                }
                relevance = score_paper_candidate(
                    paper_data=paper_data,
                    structured_idea=structured_idea,
                    query_used=doc.metadata.get("_query_used", ""),
                )
                # Attach relevance metadata to document
                doc.metadata["relevance_score"] = relevance.relevance_score
                doc.metadata["relationship"] = relevance.relationship
                doc.metadata["relevance_reason"] = relevance.reason

                if relevance.selected:
                    selected_docs.append(doc)
                else:
                    logger.debug(
                        f"REJECTED paper: {doc.title[:60]} "
                        f"(score={relevance.relevance_score}, reason={relevance.reason})"
                    )
                scored_papers.append((relevance.relevance_score, doc))

            # Safety net: if 0 selected but candidates exist, force-select top N
            if not selected_docs and scored_papers:
                scored_papers.sort(key=lambda x: x[0], reverse=True)
                force_count = min(8, len(scored_papers))
                logger.warning(
                    f"Research: 0 papers passed threshold {PAPER_MIN_RELEVANCE}, "
                    f"force-selecting top {force_count} by score"
                )
                for score, doc in scored_papers[:force_count]:
                    if doc.metadata.get("relationship") == "IRRELEVANT":
                        doc.metadata["relationship"] = "ADJACENT"
                    selected_docs.append(doc)

            # Cap total selected
            from backend.core.relevance import PAPER_MAX_SELECTED
            if len(selected_docs) > PAPER_MAX_SELECTED:
                # Sort by relevance and take top N
                selected_docs.sort(
                    key=lambda d: d.metadata.get("relevance_score", 0),
                    reverse=True
                )
                selected_docs = selected_docs[:PAPER_MAX_SELECTED]
        else:
            # No structured idea — pass all deduped docs through
            selected_docs = deduped_docs

        # Update diagnostics
        s2_selected = [d for d in selected_docs if d.source == "semantic_scholar"]
        cr_selected = [d for d in selected_docs if d.source == "crossref"]
        ieee_selected = [d for d in selected_docs if d.source == "ieee_xplore"]

        s2_diag.after_relevance_filter = len(s2_selected)
        s2_diag.selected = len(s2_selected)
        s2_diag.rejected = s2_diag.after_dedup - s2_diag.selected

        cr_diag.after_relevance_filter = len(cr_selected)
        cr_diag.selected = len(cr_selected)
        cr_diag.rejected = cr_diag.after_dedup - cr_diag.selected

        ieee_diag.after_relevance_filter = len(ieee_selected)
        ieee_diag.selected = len(ieee_selected)
        ieee_diag.rejected = ieee_diag.after_dedup - ieee_diag.selected

        duration_ms = (time.time() - start_time) * 1000
        s2_diag.duration_ms = duration_ms
        cr_diag.duration_ms = duration_ms
        ieee_diag.duration_ms = duration_ms

        logger.info(
            f"Research pipeline: S2={s2_diag.raw_candidates}→{s2_diag.selected}, "
            f"Crossref={cr_diag.raw_candidates}→{cr_diag.selected}, "
            f"IEEE={ieee_diag.raw_candidates}→{ieee_diag.selected}"
        )

        result = ResearchSearchResult(
            documents=selected_docs,
            total_found=raw_count,
            returned=len(selected_docs),
            partial=partial,
            providers_used=providers_used,
        )

        diagnostics = {
            "semantic_scholar": s2_diag,
            "crossref": cr_diag,
            "ieee_xplore": ieee_diag,
        }

        return result, diagnostics
