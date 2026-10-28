"""
DIME Backend - Comparison Models

SQLAlchemy models for Comparison Analysis reports and candidates.
Maps directly to the "ComparisonReport" and "ComparisonCandidate" tables.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base


class ComparisonReportModel(Base):
    """A comparison report comparing 2 to 4 validated ideas."""

    __tablename__ = "ComparisonReport"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    reportNumber: Mapped[Optional[int]] = mapped_column(
        Integer,
        server_default=text("nextval('\"ComparisonReport_reportNumber_seq\"')"),
        nullable=False,
    )
    userId: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    objective: Mapped[str] = mapped_column(
        String(200), default="Choose the best opportunity for an MVP", nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False, index=True)
    methodologyVersion: Mapped[str] = mapped_column(
        String(100), default="Multi-Vector Pareto Synthesis v3.4", nullable=False
    )
    selectedWeights: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    recommendation: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    paretoFrontier: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    dataComparability: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    executiveTakeaway: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    candidatesCount: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    durationMs: Mapped[Optional[int]] = mapped_column(Integer)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    completedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    candidates: Mapped[List[ComparisonCandidateModel]] = relationship(
        "ComparisonCandidateModel",
        back_populates="comparison",
        cascade="all, delete-orphan",
        order_by="ComparisonCandidateModel.candidatePosition",
    )


class ComparisonCandidateModel(Base):
    """An individual idea candidate within a comparison report."""

    __tablename__ = "ComparisonCandidate"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    comparisonId: Mapped[str] = mapped_column(
        String(50), ForeignKey("ComparisonReport.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ideaId: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    analysisId: Mapped[str] = mapped_column(String(50), nullable=False)
    candidatePosition: Mapped[int] = mapped_column(Integer, nullable=False)
    ideaTitle: Mapped[str] = mapped_column(String(500), nullable=False)
    ideaDomain: Mapped[Optional[str]] = mapped_column(String(200))
    ideaDescription: Mapped[Optional[str]] = mapped_column(Text)
    analysisScore: Mapped[Optional[float]] = mapped_column(Float)
    scores: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    strengths: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    vulnerabilities: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    tradeoffs: Mapped[Optional[str]] = mapped_column(Text)  # JSON string
    sourcesCount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    analyzedAt: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    comparison: Mapped[ComparisonReportModel] = relationship(
        "ComparisonReportModel", back_populates="candidates"
    )

    __table_args__ = (
        UniqueConstraint("comparisonId", "ideaId", name="ComparisonCandidate_comparisonId_ideaId_key"),
    )
