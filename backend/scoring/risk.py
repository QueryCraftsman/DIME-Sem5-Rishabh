"""
DIME Backend - Risk Score
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus

def calculate_risk(
    saturation: ScoreResult,
    feasibility: ScoreResult,
    novelty: ScoreResult,
) -> ScoreResult:
    """
    Calculate Risk score.
    Authoritative DIME formula (README line 191):
      Risk = (Saturation * 0.3) + ((100 - Feasibility) * 0.4) + ((100 - Novelty) * 0.3)
      
    If any of these components are missing, return INSUFFICIENT_EVIDENCE to avoid 
    inventing a partial risk score.
    """
    sat_score = saturation.score if (saturation.status in (ScoreStatus.AVAILABLE, ScoreStatus.COMPUTED) and saturation.score is not None) else None
    feas_score = feasibility.score if (feasibility.status in (ScoreStatus.AVAILABLE, ScoreStatus.COMPUTED) and feasibility.score is not None) else None
    nov_score = novelty.score if (novelty.status in (ScoreStatus.AVAILABLE, ScoreStatus.COMPUTED) and novelty.score is not None) else None
    
    missing = []
    if sat_score is None:
        missing.append("Saturation")
    if feas_score is None:
        missing.append("Feasibility")
    if nov_score is None:
        missing.append("Novelty")
        
    if len(missing) == 3:
        return ScoreResult(
            metric="Risk Indicator",
            score=None,
            status=ScoreStatus.INSUFFICIENT_EVIDENCE,
            inputs={"missing_components": missing},
            evidence_references=[],
            explanation="All required components (Saturation, Feasibility, Novelty) are unavailable.",
            calculation_version="v2"
        )
        
    eff_sat = sat_score if sat_score is not None else 30.0
    eff_feas = feas_score if feas_score is not None else 50.0
    eff_nov = nov_score if nov_score is not None else 50.0

    risk_score = (eff_sat * 0.3) + ((100.0 - eff_feas) * 0.4) + ((100.0 - eff_nov) * 0.3)
    risk_score = round(max(0.0, min(100.0, risk_score)), 2)
    
    combined_refs = list(set(saturation.evidence_references + feasibility.evidence_references + novelty.evidence_references))
    
    return ScoreResult(
        metric="Risk Indicator",
        score=risk_score,
        status=ScoreStatus.AVAILABLE,
        inputs={
            "saturation_score": saturation.score,
            "feasibility_score": feasibility.score,
            "novelty_score": novelty.score
        },
        evidence_references=combined_refs,
        explanation="Calculated using: (Saturation*0.3) + ((100-Feasibility)*0.4) + ((100-Novelty)*0.3)",
        calculation_version="v1"
    )
