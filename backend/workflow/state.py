"""
DIME Backend - LangGraph State Definition.
"""

from typing import TypedDict, Any, Annotated
import operator

def overwrite(a: Any, b: Any) -> Any:
    """Always return the right-hand value (latest)."""
    return b

class AnalysisState(TypedDict):
    """
    The state for the LangGraph analysis workflow.
    This provides the execution boundary and transient state for a running analysis.
    """
    analysis_id: str
    
    # Input Idea Information
    idea: dict[str, Any]
    
    # Lifecycle
    status: Annotated[str, overwrite]
    current_stage: Annotated[str, overwrite]
    progress: Annotated[int, overwrite]
    
    # Pipeline Overhaul: Idea Understanding & Query Planning
    structured_idea: Annotated[dict[str, Any] | None, overwrite]
    query_plan: Annotated[dict[str, Any] | None, overwrite]
    retrieval_diagnostics: Annotated[dict[str, Any] | None, overwrite]
    
    # Evidence (store IDs, not raw text, to keep state lightweight)
    evidence_references: list[str]
    _raw_documents: Annotated[list[Any] | None, overwrite]
    
    # Phase 10: AI Agents structured state
    plan: dict[str, Any] | None
    research_findings: dict[str, Any] | None
    competition_findings: dict[str, Any] | None
    synthesis: dict[str, Any] | None
    
    # Phase 11: Deterministic Scores
    scores: dict[str, Any] | None
    
    # Error tracking
    errors: Annotated[list[str], operator.add]
