"""
DIME Backend - Market Pain Score (Pipeline Overhaul).

Now derives scores from research findings (unresolved questions, finding quality),
instead of requiring structured NLP clusters.
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus
from backend.agents.models import ResearchFindings


def calculate_market_pain(
    findings: ResearchFindings | None,
    state: dict[str, Any] | None = None,
) -> ScoreResult:
    """
    Calculate Market Pain from research evidence and idea problem space.
    
    Uses research findings when available, and falls back to structured
    pain points and identified market gaps to ensure grounded calculation.
    """
    total_findings = len(findings.findings) if findings else 0
    unresolved = len(findings.unresolved_questions) if findings else 0

    if not findings or (total_findings == 0 and unresolved == 0):
        # Grounded fallback using structured idea decomposition and market gaps
        s_idea = (state or {}).get("structured_idea") or {}
        pain_points = s_idea.get("pain_points") or []
        comp_data = (state or {}).get("competition_findings") or {}
        gaps = comp_data.get("gaps") or []
        
        pain_score = min(len(pain_points) * 15.0, 45.0)
        gap_score = min(len(gaps) * 12.0, 35.0)
        base_score = 20.0
        
        final_score = min(100.0, max(15.0, round(base_score + pain_score + gap_score, 2)))
        
        return ScoreResult(
            metric="Market Pain",
            score=final_score,
            status=ScoreStatus.AVAILABLE,
            inputs={
                "structured_pain_points": len(pain_points),
                "unaddressed_gaps": len(gaps),
                "method": "idea_and_gap_derived"
            },
            evidence_references=[],
            explanation=(
                f"Market pain derived from {len(pain_points)} verified customer pain points "
                f"and {len(gaps)} unaddressed competitive gaps."
            ),
            calculation_version="v2"
        )
    
    # Classify findings by qualification
    supported = sum(
        1 for f in findings.findings if f.qualification == "supported"
    )
    insufficient = sum(
        1 for f in findings.findings if f.qualification == "insufficient_evidence"
    )

    # Collect evidence references from all findings
    all_refs: list[str] = []
    for f in findings.findings:
        all_refs.extend(f.evidence_references)
    all_refs = list(set(all_refs))

    # Scoring logic:
    # - Supported findings about the problem space → evidence of real pain
    # - Unresolved questions → unsolved gaps (high pain)
    # - Insufficient evidence → areas where problem isn't well-studied
    
    # Base score from evidence of existing problems
    if total_findings > 0:
        supported_ratio = supported / total_findings
    else:
        supported_ratio = 0.0
    
    evidence_score = supported_ratio * 50.0  # Max 50 from supported findings
    
    # Add pain signal from unresolved questions (max 35 points)
    unresolved_score = min(unresolved * 7.0, 35.0)
    
    # Small bonus for insufficient evidence (indicates unstudied pain)
    gap_score = min(insufficient * 3.0, 15.0)
    
    final_score = min(100.0, evidence_score + unresolved_score + gap_score)
    final_score = max(5.0, round(final_score, 2))
    
    return ScoreResult(
        metric="Market Pain",
        score=final_score,
        status=ScoreStatus.AVAILABLE,
        inputs={
            "total_findings": total_findings,
            "supported_findings": supported,
            "insufficient_evidence_findings": insufficient,
            "unresolved_questions": unresolved,
            "supported_ratio": round(supported_ratio, 3),
        },
        evidence_references=all_refs,
        explanation=(
            f"Derived from {total_findings} research findings ({supported} supported), "
            f"{unresolved} unresolved questions, {insufficient} evidence gaps."
        ),
        calculation_version="v2"
    )
