"""
DIME Backend — Retrieval Models.

Defines the schemas for retrieval queries and canonical retrieval results.
"""

from typing import Any

from pydantic import BaseModel, Field


class RetrievalQuery(BaseModel):
    """Canonical retrieval query representation."""

    query_text: str = Field(..., description="The textual query to search for.")
    top_k: int | None = Field(
        default=None, description="Override the final number of results to return."
    )

    # ── Metadata Filters ─────────────────────────────────────
    source: list[str] | None = Field(
        default=None, description="Filter by original sources (e.g., ['github', 'crossref'])."
    )
    source_type: list[str] | None = Field(
        default=None, description="Filter by source entity type (e.g., ['paper', 'repository'])."
    )
    published_after: str | None = Field(
        default=None, description="Only return documents published after this ISO date."
    )


class RetrievalResult(BaseModel):
    """Canonical retrieval result representation."""

    chunk_id: str
    document_id: str
    text: str
    source: str
    source_id: str
    title: str
    canonical_url: str | None = None

    # ── Scores ───────────────────────────────────────────────
    dense_score: float | None = None
    sparse_score: float | None = None
    hybrid_score: float | None = None
    rerank_score: float | None = None
    final_score: float = 0.0

    # ── Provenance & Lifecycle ───────────────────────────────
    content_hash: str
    retrieved_at: str | None = None
    expires_at: str | None = None

    metadata: dict[str, Any] = Field(default_factory=dict)
