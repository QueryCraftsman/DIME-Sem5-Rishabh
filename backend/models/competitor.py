"""
DIME Backend — Competitor & Score models.
"""

from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base
from backend.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Competitor(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A competitor identified during analysis."""

    __tablename__ = "competitors"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str | None] = mapped_column(String(2000))
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # github, web, research
    competitor_type: Mapped[str] = mapped_column(String(50), nullable=False)  # direct, indirect, related, research_impl

    # ── GitHub metadata ───────────────────────────────────────
    github_url: Mapped[str | None] = mapped_column(String(2000))
    stars: Mapped[int | None] = mapped_column(Integer)
    forks: Mapped[int | None] = mapped_column(Integer)
    language: Mapped[str | None] = mapped_column(String(100))
    last_updated: Mapped[str | None] = mapped_column(String(50))

    # ── Feature comparison ────────────────────────────────────
    features: Mapped[str | None] = mapped_column(Text)  # JSON array
    technologies: Mapped[str | None] = mapped_column(Text)  # JSON array
    target_audience: Mapped[str | None] = mapped_column(String(500))
    pricing: Mapped[str | None] = mapped_column(String(500))


class Score(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A scored dimension of an analysis."""

    __tablename__ = "scores"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False
    )
    dimension: Mapped[str] = mapped_column(String(100), nullable=False)  # novelty, competition, demand, feasibility, risk
    score: Mapped[float] = mapped_column(Float, nullable=False)
    interpretation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_count: Mapped[int] = mapped_column(Integer, default=0)
    evidence_ids: Mapped[str | None] = mapped_column(Text)  # JSON array


class Report(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Final generated report."""

    __tablename__ = "reports"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # JSON — structured report sections
    executive_summary: Mapped[str | None] = mapped_column(Text)
    overall_confidence: Mapped[float] = mapped_column(Float, default=0.0)
