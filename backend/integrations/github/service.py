"""
GitHub Service Layer — Pipeline Overhaul.

Implements the full candidate retrieval pipeline:
  Multi-query search → Candidate collection → Deduplication →
  Basic filtering → Relevance scoring → Selection

Replaces the old "take first 30 sorted by stars" approach.
"""

import asyncio
import base64
import logging
import time
from typing import Any

from backend.core.config import get_settings
from backend.core.relevance import (
    score_github_candidate,
    is_generic_repository,
    GITHUB_MIN_RELEVANCE,
)
from backend.agents.models import (
    StructuredIdea,
    SourceQuery,
    CandidateRelevance,
    RetrievalDiagnostics,
)
from backend.integrations.github.adapter import GitHubAdapter
from backend.integrations.github.client import GitHubClient
from backend.integrations.github.exceptions import GitHubRateLimitExceeded
from backend.schemas.github import GitHubSearchResult
from backend.schemas.source import SourceDocument

logger = logging.getLogger(__name__)


class GitHubService:
    def __init__(self, client: GitHubClient | None = None) -> None:
        self.settings = get_settings()
        self._client = client
        self._owns_client = client is None

    # ── Fallback query generation (if no query plan provided) ───
    def _generate_queries(self, idea: str) -> list[str]:
        """Simple fallback query generation for backward compatibility."""
        words = [w for w in idea.lower().split() if len(w) > 3]
        queries = []
        exact_query = " ".join(words[:5])
        if exact_query:
            queries.append(f"{exact_query} in:readme,description")
        if words:
            queries.append(f"{words[0]} {words[-1]} system in:readme")
        return list(dict.fromkeys(queries))[:3]

    _generate_fallback_queries = _generate_queries

    async def acquire_evidence(
        self,
        idea: str,
        structured_idea: StructuredIdea | None = None,
        source_queries: list[SourceQuery] | None = None,
        negative_keywords: list[str] | None = None,
    ) -> tuple[GitHubSearchResult, RetrievalDiagnostics]:
        """
        Full GitHub retrieval pipeline:
        1. Multi-query candidate search (large pool)
        2. Deduplication by repo ID
        3. Basic filtering (archived, forks, empty, generic)
        4. README enrichment for promising candidates
        5. Relevance scoring with configurable weights
        6. Dynamic threshold-based selection
        """
        start_time = time.time()
        client = self._client or GitHubClient()

        # Build diagnostics tracker
        diag = RetrievalDiagnostics(source="github")

        try:
            if self._owns_client:
                await client.__aenter__()

            # ── PHASE A: Multi-Query Candidate Search ──────────────
            if source_queries:
                # Use intelligent queries from QueryPlanner
                queries = [sq.query for sq in sorted(source_queries, key=lambda q: q.priority, reverse=True)]
            else:
                # Fallback query generation
                queries = self._generate_queries(idea)

            diag.queries_used = len(queries)
            all_repos: dict[str, dict[str, Any]] = {}
            partial = False

            # Search with a LARGER candidate pool per query
            max_per_query = 30  # GitHub API max per page
            max_total_candidates = 150  # Enlarged candidate pool

            for q in queries:
                if len(all_repos) >= max_total_candidates:
                    break

                page = 1
                max_pages = 2  # Up to 60 results per query

                while page <= max_pages:
                    try:
                        logger.info(f"GitHub search: '{q}' (page {page})")
                        res = await client.get(
                            "/search/repositories",
                            params={
                                "q": q,
                                "per_page": max_per_query,
                                "page": page,
                                "sort": "stars",
                                "order": "desc",
                            },
                        )

                        items = res.get("items", [])
                        if not items:
                            break

                        for item in items:
                            repo_id = str(item["id"])
                            if repo_id not in all_repos:
                                all_repos[repo_id] = item

                        if res.get("total_count", 0) <= page * max_per_query:
                            break
                        page += 1

                    except GitHubRateLimitExceeded:
                        logger.warning("Rate limit exceeded during GitHub search.")
                        partial = True
                        break
                    except Exception as e:
                        logger.error(f"GitHub search failed for '{q}': {e}")
                        partial = True
                        break

                if partial:
                    break

            diag.raw_candidates = len(all_repos)
            logger.info(f"GitHub: {diag.raw_candidates} raw candidates from {diag.queries_used} queries")

            # ── PHASE B: Basic Filtering ───────────────────────────
            filtered_repos: dict[str, dict[str, Any]] = {}
            for repo_id, repo in all_repos.items():
                # Skip archived repos
                if repo.get("archived", False):
                    continue
                # Skip forks (they're copies, not independent projects)
                if repo.get("fork", False):
                    continue
                filtered_repos[repo_id] = repo

            diag.after_basic_filter = len(filtered_repos)
            diag.after_dedup = diag.raw_candidates  # Already deduped by repo_id

            # ── PHASE C: README Enrichment for Top Candidates ──────
            # Sort by stars to prioritize README fetching for high-signal repos
            sorted_repos = sorted(
                filtered_repos.values(),
                key=lambda x: x.get("stargazers_count", 0),
                reverse=True,
            )

            # Fetch READMEs for more candidates than before (up to 30)
            max_readmes = min(30, len(sorted_repos))
            repos_for_readme = sorted_repos[:max_readmes]
            readme_contents: dict[str, str] = {}

            semaphore = asyncio.Semaphore(5)

            async def fetch_readme(repo: dict[str, Any]) -> tuple[str, str | None]:
                owner = (repo.get("owner") or {}).get("login", "")
                name = repo.get("name", "")
                repo_id = str(repo.get("id", ""))
                if not owner or not name:
                    return repo_id, None
                async with semaphore:
                    try:
                        res = await client.get(f"/repos/{owner}/{name}/readme")
                        if res.get("encoding") == "base64" and "content" in res:
                            content = base64.b64decode(res["content"]).decode("utf-8", errors="ignore")
                            return repo_id, content
                    except GitHubRateLimitExceeded:
                        nonlocal partial
                        partial = True
                    except Exception as e:
                        logger.debug(f"Failed to fetch README for {owner}/{name}: {e}")
                return repo_id, None

            if repos_for_readme and not partial:
                tasks = [fetch_readme(repo) for repo in repos_for_readme]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for r in results:
                    if (
                        isinstance(r, tuple)
                        and len(r) == 2
                        and isinstance(r[0], str)
                        and isinstance(r[1], str)
                        and r[1]
                    ):
                        readme_contents[r[0]] = r[1]

            # Attach READMEs to repo data
            for repo_id, readme in readme_contents.items():
                if repo_id in filtered_repos:
                    filtered_repos[repo_id]["_readme_text"] = readme

            # ── PHASE D: Relevance Scoring ─────────────────────────
            scored_candidates: list[tuple[CandidateRelevance, dict[str, Any]]] = []

            for repo_id, repo in filtered_repos.items():
                if structured_idea:
                    relevance = score_github_candidate(
                        repo_data=repo,
                        structured_idea=structured_idea,
                        query_used=queries[0] if queries else "",
                        negative_keywords=negative_keywords,
                    )
                else:
                    # No structured idea available — accept everything above basic filter
                    relevance = CandidateRelevance(
                        source="github",
                        title=repo.get("full_name", ""),
                        url=repo.get("html_url", ""),
                        relationship="TECHNICAL_REFERENCE",
                        relevance_score=0.60,
                        reason="No structured idea available for scoring",
                        selected=True,
                    )
                scored_candidates.append((relevance, repo))

            # ── PHASE E: Selection by Threshold ────────────────────
            # Sort by relevance score descending
            scored_candidates.sort(key=lambda x: x[0].relevance_score, reverse=True)

            selected: list[tuple[CandidateRelevance, dict[str, Any]]] = []
            rejected: list[CandidateRelevance] = []

            for relevance, repo in scored_candidates:
                if relevance.selected and relevance.relationship != "IRRELEVANT":
                    selected.append((relevance, repo))
                else:
                    rejected.append(relevance)

            # Safety net: if threshold selected 0 but we have candidates,
            # force-select the top 10 by score (never return empty when data exists)
            if not selected and scored_candidates:
                min_force = min(10, len(scored_candidates))
                logger.warning(
                    f"GitHub: 0 candidates passed threshold {GITHUB_MIN_RELEVANCE}, "
                    f"force-selecting top {min_force} by score"
                )
                for relevance, repo in scored_candidates[:min_force]:
                    relevance.selected = True
                    if relevance.relationship == "IRRELEVANT":
                        relevance.relationship = "ADJACENT"
                    selected.append((relevance, repo))
                rejected = [r for r in rejected if not r.selected]

            # Cap at max selected to prevent flooding downstream
            from backend.core.relevance import GITHUB_MAX_SELECTED
            if len(selected) > GITHUB_MAX_SELECTED:
                selected = selected[:GITHUB_MAX_SELECTED]

            diag.after_relevance_filter = len(selected)
            diag.selected = len(selected)
            diag.rejected = len(scored_candidates) - len(selected)

            logger.info(
                f"GitHub pipeline: {diag.raw_candidates} candidates → "
                f"{diag.after_basic_filter} filtered → "
                f"{diag.selected} selected (threshold={GITHUB_MIN_RELEVANCE})"
            )

            # Log top rejected for debugging
            for rej in rejected[:5]:
                logger.debug(f"REJECTED: {rej.title} (score={rej.relevance_score}, reason={rej.reason})")

            # ── PHASE F: Map to SourceDocuments ────────────────────
            documents: list[SourceDocument] = []
            for relevance, repo in selected:
                repo_id = str(repo["id"])
                readme = readme_contents.get(repo_id)
                doc = GitHubAdapter.normalize_repository(repo, readme_text=readme)
                # Attach relevance metadata
                doc.metadata["relevance_score"] = relevance.relevance_score
                doc.metadata["relationship"] = relevance.relationship
                doc.metadata["relevance_reason"] = relevance.reason
                doc.metadata["query_used"] = relevance.query_used
                documents.append(doc)

            diag.duration_ms = (time.time() - start_time) * 1000

            result = GitHubSearchResult(
                documents=documents,
                total_found=diag.raw_candidates,
                returned=len(documents),
                rate_limit=client.latest_rate_limit,
                partial=partial,
            )

            return result, diag

        finally:
            if self._owns_client:
                await client.__aexit__(None, None, None)
