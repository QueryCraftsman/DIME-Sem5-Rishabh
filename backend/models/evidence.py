"""
DIME Backend — Source & Evidence models.

Tracks document provenance from source → document → chunk → evidence → finding.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base
from backend.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class SourceDocument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A canonical document retrieved from a source, representing temporary shared intelligence."""

    __tablename__ = "source_documents"
    
    __table_args__ = (
        UniqueConstraint("source", "source_id", name="uq_source_document_identity"),
    )

    source: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. github, semantic_scholar
    source_id: Mapped[str] = mapped_column(String(1000), nullable=False) # e.g. repository ID, DOI, URL
    source_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. repository, paper, web_page
    source_url: Mapped[str | None] = mapped_column(String(2000))
    title: Mapped[str] = mapped_column(String(1000), nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    content_hash: Mapped[str | None] = mapped_column(String(64), index=True)  # SHA-256
    language: Mapped[str] = mapped_column(String(10), default="en")
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    retrieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # ── Research-specific metadata ────────────────────────────
    doi: Mapped[str | None] = mapped_column(String(500))
    authors: Mapped[str | None] = mapped_column(Text)  # JSON array
    abstract: Mapped[str | None] = mapped_column(Text)
    publication: Mapped[str | None] = mapped_column(String(500))
    publication_year: Mapped[int | None] = mapped_column(Integer)

    # ── GitHub-specific metadata ──────────────────────────────
    stars: Mapped[int | None] = mapped_column(Integer)
    forks: Mapped[int | None] = mapped_column(Integer)
    topics: Mapped[str | None] = mapped_column(Text)  # JSON array
    languages: Mapped[str | None] = mapped_column(Text)  # JSON object

    # ── Pipeline & Storage metadata ───────────────────────────
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="acquired")
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSON)
    
    embedding_model: Mapped[str | None] = mapped_column(String(200))
    embedding_version: Mapped[str | None] = mapped_column(String(50))
    ingestion_version: Mapped[str | None] = mapped_column(String(50))

    chunks: Mapped[list[SourceChunk]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class SourceChunk(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A chunk of a source document for embedding/retrieval."""

    __tablename__ = "source_chunks"
    
    __table_args__ = (
        UniqueConstraint("document_id", "content_hash", "chunk_index", name="uq_source_chunk_identity"),
    )

    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), index=True)
    token_count: Mapped[int | None] = mapped_column(Integer)
    qdrant_point_id: Mapped[str | None] = mapped_column(String(36))

    document: Mapped[SourceDocument] = relationship(back_populates="chunks")


class Evidence(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A piece of evidence extracted from retrieved content."""

    __tablename__ = "evidence"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    chunk_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("source_chunks.id", ondelete="SET NULL")
    )
    document_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("source_documents.id", ondelete="SET NULL")
    )

    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)  # research, competitor, market, technical
    claim: Mapped[str] = mapped_column(Text, nullable=False)
    supporting_text: Mapped[str | None] = mapped_column(Text)
    source_url: Mapped[str | None] = mapped_column(String(2000))
    source_title: Mapped[str | None] = mapped_column(String(1000))
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0)


class Finding(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An analytical finding derived from evidence."""

    __tablename__ = "findings"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # novelty, competition, feasibility, market, risk
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    evidence_ids: Mapped[str | None] = mapped_column(Text)  # JSON array of evidence IDs
