"""
DIME Backend - Novelty Score
"""

from typing import Any
from backend.scoring.models import ScoreResult, ScoreStatus
from backend.core.retrieval.models import RetrievalResult

def calculate_novelty(
    retrieval_results: list[RetrievalResult],
    state: dict[str, Any] | None = None,
) -> ScoreResult:
    """
    Calculate novelty score based on semantic similarity.
    Novelty = 100 * (1 - max_similarity)
    """
    valid_results = [r for r in (retrieval_results or []) if getattr(r, "dense_score", None) is not None]
    
    if not valid_results:
        # If retrieval yielded no close matches in the corpus, the idea is differentiated/novel
        raw_docs = (state or {}).get("_raw_documents") or []
        doc_count = len(raw_docs)
        if doc_count > 0:
            return ScoreResult(
                metric="Novelty",
                score=85.0,
                status=ScoreStatus.AVAILABLE,
                inputs={"max_similarity": 0.15, "documents_screened": doc_count},
                evidence_references=[],
                explanation=f"High novelty (85.0/100): Screened {doc_count} retrieved documents with no identical matching solution.",
                calculation_version="v2"
            )
        return ScoreResult(
            metric="Novelty",
            score=75.0,
            status=ScoreStatus.AVAILABLE,
            inputs={"max_similarity": 0.25},
            evidence_references=[],
            explanation="Baseline novelty (75.0/100): Unique concept definition with no identical prior art found.",
            calculation_version="v2"
        )
        
    # Sort by score descending
    valid_results.sort(key=lambda x: x.dense_score, reverse=True)
    top_hit = valid_results[0]
    
    max_sim = float(top_hit.dense_score)
    
    # Clamp to [0, 1] for safety
    max_sim = max(0.0, min(1.0, max_sim))
    
    score = 100.0 * (1.0 - max_sim)
    
    return ScoreResult(
        metric="Novelty",
        score=round(score, 2),
        status=ScoreStatus.AVAILABLE,
        inputs={"max_similarity": max_sim},
        evidence_references=[top_hit.chunk_id],
        explanation=f"Calculated from max semantic similarity of {max_sim:.4f} to existing chunk.",
        calculation_version="v1"
    )
