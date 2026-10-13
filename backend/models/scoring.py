"""
DIME Backend - Scoring Models

SQLAlchemy models for persisting deterministic analysis scores.
"""

from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base
from backend.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class AnalysisScore(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A single deterministic score for an analysis (e.g. Novelty, Feasibility).
    """

    __tablename__ = "analysis_scores"

    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    metric_name: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    calculation_version: Mapped[str] = mapped_column(String(20), nullable=False)
    
    inputs: Mapped[str | None] = mapped_column(Text, nullable=True)               # JSON encoded
    evidence_references: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON encoded list of chunk IDs
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

