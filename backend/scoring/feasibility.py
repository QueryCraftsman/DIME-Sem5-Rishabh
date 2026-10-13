"""
DIME Backend - Feasibility Score (Pipeline Overhaul).

Now provides a baseline feasibility from evidence (technical references found, 
competition implementation quality) when structured inputs aren't available.
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus
from backend.workflow.state import AnalysisState


def calculate_feasibility(
    state: AnalysisState,
) -> ScoreResult:
    """
    Calculate Feasibility score.
    
    When structured inputs (tech_familiarity, team_size, timeline_months) are 
    available, uses the weighted formula. Otherwise, derives a baseline feasibility
    estimate from the evidence collected:
    - More technical references found → easier to build (known patterns)
    - More competitors already exist → proves technical feasibility
    - Active GitHub repos with implementations → confirms feasibility
    """
    idea = state.get("idea", {})
    
    # Check for explicit structured inputs first
    tech_familiarity = idea.get("tech_familiarity")
    team_size = idea.get("team_size")
    timeline_months = idea.get("timeline_months")
    
    if tech_familiarity is not None and team_size is not None and timeline_months is not None:
        # Full structured calculation
        tech_score = min(100.0, max(0.0, float(tech_familiarity)))
        team_score = min(100.0, max(0.0, min(float(team_size) * 10, 100.0)))
        timeline_score = min(100.0, max(0.0, 100.0 - (float(timeline_months) - 3) * 5))
        
        feasibility = (
            0.35 * tech_score
            + 0.25 * team_score
            + 0.20 * timeline_score
            + 0.20 * 50.0  # Default legal/capital score
        )
        feasibility = round(max(0.0, min(100.0, feasibility)), 2)
        
        return ScoreResult(
            metric="Feasibility",
            score=feasibility,
            status=ScoreStatus.AVAILABLE,
            inputs={
                "tech_familiarity": tech_familiarity,
                "team_size": team_size,
                "timeline_months": timeline_months,
            },
            evidence_references=[],
            explanation="Calculated from structured user inputs.",
            calculation_version="v2"
        )
    
    # Evidence-based baseline feasibility
    competition_findings = state.get("competition_findings")
    retrieval_diag = state.get("retrieval_diagnostics") or {}
    raw_docs = state.get("_raw_documents") or []
    
    # Signal 1: GitHub implementations exist (proves technical feasibility)
    github_diag = retrieval_diag.get("github", {})
    github_selected = github_diag.get("selected", 0) if isinstance(github_diag, dict) else 0
    if github_selected == 0 and raw_docs:
        github_selected = sum(
            1 for d in raw_docs 
            if getattr(d, "source_type", None) == "github" or (isinstance(d, dict) and d.get("source_type") == "github")
        )
    
    # Signal 2: Academic papers exist across all research providers
    s2_diag = retrieval_diag.get("semantic_scholar", {})
    s2_papers = s2_diag.get("selected", 0) if isinstance(s2_diag, dict) else 0
    cr_diag = retrieval_diag.get("crossref", {})
    cr_papers = cr_diag.get("selected", 0) if isinstance(cr_diag, dict) else 0
    ieee_diag = retrieval_diag.get("ieee_xplore", {})
    ieee_papers = ieee_diag.get("selected", 0) if isinstance(ieee_diag, dict) else 0
    
    papers_found = s2_papers + cr_papers + ieee_papers
    if papers_found == 0 and raw_docs:
        papers_found = sum(
            1 for d in raw_docs 
            if getattr(d, "source_type", None) in ("semantic_scholar", "crossref", "ieee_xplore") 
            or (isinstance(d, dict) and d.get("source_type") in ("semantic_scholar", "crossref", "ieee_xplore"))
        )
    
    # Signal 3: Competitors exist (someone already built this)
    competitor_count = 0
    if competition_findings:
        competitor_count = len(competition_findings.get("competitors", []))
    
    # Scoring: more evidence of existing implementations = higher feasibility
    impl_score = min(github_selected * 5.0, 40.0)  # Max 40 from GitHub
    research_score = min(papers_found * 4.0, 25.0)   # Max 25 from papers
    comp_score = min(competitor_count * 5.0, 25.0)    # Max 25 from competitors
    base_score = 15.0  # Baseline feasibility
    
    feasibility = min(100.0, base_score + impl_score + research_score + comp_score)
    feasibility = round(feasibility, 2)
    
    return ScoreResult(
        metric="Feasibility",
        score=feasibility,
        status=ScoreStatus.AVAILABLE,
        inputs={
            "github_implementations": github_selected,
            "research_papers": papers_found,
            "competitor_count": competitor_count,
            "method": "evidence_derived",
        },
        evidence_references=[],
        explanation=(
            f"Evidence-derived: {github_selected} GitHub implementations, "
            f"{papers_found} research papers, {competitor_count} existing competitors."
        ),
        calculation_version="v2"
    )
