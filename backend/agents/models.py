"""
DIME Backend - AI Agent Structured Models (Phase 10 + Pipeline Overhaul).
"""

from typing import Any, Literal
from pydantic import BaseModel, Field


# ── Idea Understanding ─────────────────────────────────────────────────
class StructuredIdea(BaseModel):
    """Structured representation of a user's idea, produced by the IdeaAnalyzer."""
    problem: str = Field(description="The core problem being solved.")
    domain: str = Field(description="The industry/domain (e.g., 'recruitment / HR technology').")
    target_users: list[str] = Field(description="Who will use this product.")
    product_type: str = Field(description="What kind of product this is.")
    core_capabilities: list[str] = Field(description="Key functional capabilities.")
    technical_concepts: list[str] = Field(description="Technical concepts involved (NLP, embeddings, etc.).")
    market_terms: list[str] = Field(description="Industry/market terminology for searching.")
    differentiators: list[str] = Field(default_factory=list, description="What makes this idea different from existing solutions.")


# ── Query Planning ─────────────────────────────────────────────────────
class SourceQuery(BaseModel):
    """A single search query with metadata for source-specific retrieval."""
    query: str = Field(description="The search query string.")
    intent: Literal["primary", "problem", "domain", "technical", "product", "competition"] = Field(
        description="The intent/category of this query."
    )
    priority: float = Field(ge=0.0, le=1.0, description="Priority weight 0-1.")
    target_sources: list[str] = Field(
        default_factory=lambda: ["github", "semantic_scholar", "crossref", "web"],
        description="Which sources this query is designed for."
    )


class QueryPlan(BaseModel):
    """Output of the QueryPlanner: families of queries for multi-source retrieval."""
    github_queries: list[SourceQuery] = Field(description="Queries optimized for GitHub repository search.")
    paper_queries: list[SourceQuery] = Field(description="Queries optimized for academic paper search.")
    web_queries: list[SourceQuery] = Field(description="Queries optimized for web/product search.")
    negative_keywords: list[str] = Field(
        default_factory=list,
        description="Keywords that indicate IRRELEVANT results (e.g., 'awesome list', 'media streaming')."
    )


# ── Relevance Scoring ──────────────────────────────────────────────────
class CandidateRelevance(BaseModel):
    """Relevance assessment for a single candidate document."""
    document_id: str = ""
    source: str = ""
    title: str = ""
    url: str = ""
    relationship: Literal[
        "DIRECT_COMPETITOR", "INDIRECT_COMPETITOR", "TECHNICAL_REFERENCE",
        "RESEARCH_REFERENCE", "ADJACENT", "IRRELEVANT"
    ] = "IRRELEVANT"
    relevance_score: float = Field(ge=0.0, le=1.0, default=0.0)
    reason: str = ""
    query_used: str = ""
    selected: bool = False


class RetrievalDiagnostics(BaseModel):
    """Diagnostics for a single source's retrieval pipeline."""
    source: str
    queries_used: int = 0
    raw_candidates: int = 0
    after_dedup: int = 0
    after_basic_filter: int = 0
    after_relevance_filter: int = 0
    selected: int = 0
    rejected: int = 0
    duration_ms: float = 0.0


# ── Evidence Sufficiency ───────────────────────────────────────────────
class EvidenceSufficiency(BaseModel):
    """Evidence sufficiency assessment for a single metric."""
    metric: str
    evidence_count: int = 0
    high_relevance_count: int = 0
    source_diversity: int = 0
    source_types: list[str] = Field(default_factory=list)
    sufficient: bool = False
    confidence: float = 0.0
    reason: str = ""
    missing: str = ""


# ── Analysis Plan ──────────────────────────────────────────────────────
class AnalysisPlan(BaseModel):
    """Output of the Planner Agent."""
    objectives: list[str] = Field(description="List of specific analysis objectives.")
    research_questions: list[str] = Field(description="Bounded list of questions to research using evidence.")
    competitor_questions: list[str] = Field(description="Bounded list of questions to analyze existing solutions/competition.")
    evidence_requirements: list[str] = Field(description="Types of evidence needed to answer the questions.")


class ResearchFinding(BaseModel):
    """A single finding supported by evidence."""
    finding: str = Field(description="The factual finding or reasonable inference.")
    evidence_references: list[str] = Field(description="List of exact chunk_ids used to support this finding. MUST NOT BE EMPTY if finding is stated as fact.")
    qualification: str = Field(description="Qualification of confidence: 'supported', 'inferred', 'insufficient_evidence'.")


class ResearchFindings(BaseModel):
    """Output of the Research Agent."""
    findings: list[ResearchFinding] = Field(description="List of grounded findings.")
    unresolved_questions: list[str] = Field(description="Questions that could not be answered with the retrieved evidence.")


class CompetitionFinding(BaseModel):
    """A single competitor or existing solution."""
    competitor: str = Field(description="Name of the potentially relevant solution or competitor.")
    similarities: list[str] = Field(description="How this solution is similar to the user's idea.")
    differences: list[str] = Field(description="How this solution differs from the user's idea.")
    evidence_references: list[str] = Field(description="List of exact chunk_ids used to identify and support this competitor info.")
    uncertainties: str = Field(description="Any uncertainties about relevance or features.")


class CompetitionFindings(BaseModel):
    """Output of the Competition Agent."""
    competitors: list[CompetitionFinding] = Field(description="List of identified competitors/solutions.")
    gaps: list[str] = Field(description="Observed market gaps based on the analyzed solutions.")


class SynthesisResult(BaseModel):
    """Output of the Synthesis Agent."""
    key_findings: list[str] = Field(description="The most important synthesized findings.")
    market_observations: list[str] = Field(description="General market/domain observations.")
    competitor_observations: list[str] = Field(description="Synthesized observations about the competitive landscape.")
    evidence_references: list[str] = Field(description="Aggregated list of supporting chunk_ids from previous stages.")
    uncertainties: list[str] = Field(description="Remaining uncertainties, evidence gaps, or contradictions.")
