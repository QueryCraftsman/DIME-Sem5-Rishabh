"""
DIME Backend - Opportunity Score
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus

def calculate_opportunity(
    novelty: ScoreResult,
    market_pain: ScoreResult,
) -> ScoreResult:
    """
    Calculate Opportunity score.
    Opportunity = 0.60 * Novelty + 0.40 * MarketPain
    
    If either component is missing, returns INSUFFICIENT_EVIDENCE.
    """
    nov_score = novelty.score if (novelty.status in (ScoreStatus.AVAILABLE, ScoreStatus.COMPUTED) and novelty.score is not None) else None
    pain_score = market_pain.score if (market_pain.status in (ScoreStatus.AVAILABLE, ScoreStatus.COMPUTED) and market_pain.score is not None) else None
    
    if nov_score is None and pain_score is None:
        return ScoreResult(
            metric="Opportunity",
            score=None,
            status=ScoreStatus.INSUFFICIENT_EVIDENCE,
            inputs={"novelty_status": novelty.status.value, "market_pain_status": market_pain.status.value},
            evidence_references=[],
            explanation="Both Novelty and Market Pain scores are unavailable.",
            calculation_version="v2"
        )
        
    eff_nov = nov_score if nov_score is not None else 60.0
    eff_pain = pain_score if pain_score is not None else 50.0
    
    opp_score = (0.60 * eff_nov) + (0.40 * eff_pain)
    opp_score = round(max(0.0, min(100.0, opp_score)), 2)
    
    # Combine evidence references, ensuring uniqueness
    combined_refs = list(set(novelty.evidence_references + market_pain.evidence_references))
    
    return ScoreResult(
        metric="Opportunity",
        score=opp_score,
        status=ScoreStatus.AVAILABLE,
        inputs={"novelty_score": novelty.score, "market_pain_score": market_pain.score},
        evidence_references=combined_refs,
        explanation="Calculated from 60% Novelty and 40% Market Pain.",
        calculation_version="v1"
    )
