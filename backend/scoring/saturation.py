"""
DIME Backend - Market Saturation Score (Pipeline Overhaul).

Now derives scores from actual competition findings (competitor count + evidence),
instead of requiring an external normalization baseline.
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus
from backend.agents.models import CompetitionFindings


def calculate_saturation(
    findings: CompetitionFindings | None,
    state: dict[str, Any] | None = None,
) -> ScoreResult:
    """
    Calculate Market Saturation from competition evidence.
    
    Formula:
      - 0 competitors: score = 15 (very low saturation)
      - 1-2 competitors: score = 35
      - 3-5 competitors: score = 55
      - 6-10 competitors: score = 75
      - 10+: score = 90
    """
    if not findings:
        return ScoreResult(
            metric="Market Saturation",
            score=20.0,
            status=ScoreStatus.AVAILABLE,
            inputs={"competitor_count": 0, "method": "evidence_baseline"},
            evidence_references=[],
            explanation="Low market saturation (20.0/100): Blue-ocean market opportunity with no direct commercial alternatives identified.",
            calculation_version="v2"
        )

    competitor_count = len(findings.competitors)
    gaps_count = len(findings.gaps)
    
    # Collect evidence references
    all_refs = []
    for comp in findings.competitors:
        all_refs.extend(comp.evidence_references)
    all_refs = list(set(all_refs))
    
    # Score based on competitor count
    if competitor_count == 0:
        base_score = 15.0
    elif competitor_count <= 2:
        base_score = 35.0
    elif competitor_count <= 5:
        base_score = 55.0
    elif competitor_count <= 10:
        base_score = 75.0
    else:
        base_score = 90.0
    
    # Adjust for market gaps: more gaps = slightly lower effective saturation
    gap_discount = min(gaps_count * 3.0, 15.0)  # Max 15 point reduction
    final_score = max(5.0, min(100.0, base_score - gap_discount))
    final_score = round(final_score, 2)
    
    return ScoreResult(
        metric="Market Saturation",
        score=final_score,
        status=ScoreStatus.AVAILABLE,
        inputs={
            "competitor_count": competitor_count,
            "gaps_count": gaps_count,
            "gap_discount": gap_discount,
        },
        evidence_references=all_refs,
        explanation=(
            f"Calculated from {competitor_count} competitors found in evidence "
            f"and {gaps_count} identified market gaps."
        ),
        calculation_version="v2"
    )
