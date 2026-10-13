"""
DIME Backend - Scoring Engine
"""

from typing import Any
import logging

from backend.workflow.state import AnalysisState
from backend.core.retrieval.dense import DenseRetriever
from backend.core.retrieval.models import RetrievalQuery
from backend.agents.models import CompetitionFindings, ResearchFindings

from backend.scoring.models import ScoreResult
from backend.scoring.novelty import calculate_novelty
from backend.scoring.saturation import calculate_saturation
from backend.scoring.market_pain import calculate_market_pain
from backend.scoring.feasibility import calculate_feasibility
from backend.scoring.opportunity import calculate_opportunity
from backend.scoring.risk import calculate_risk

logger = logging.getLogger(__name__)

class ScoringEngine:
    """
    Deterministically computes DIME scores using structured inputs from Phase 10
    and existing retrieval services from Phase 8.
    """
    
    def __init__(self, dense_retriever: DenseRetriever):
        self.dense_retriever = dense_retriever
        
    async def compute_all_scores(self, state: AnalysisState) -> dict[str, ScoreResult]:
        """Compute all Phase 11 scores and return as a dictionary."""
        
        idea = state.get("idea", {})
        
        # We need semantic similarity for Novelty. We re-run dense retrieval for the idea.
        # This reuses the existing Phase 8 infrastructure, satisfying the requirement to use 
        # actual semantic similarity.
        query_text = idea.get("title", "")
        if idea.get("description"):
            query_text = f"{query_text}: {idea['description']}"[:256]
            
        retrieval_results = []
        if query_text:
            try:
                retrieval_results = await self.dense_retriever.retrieve(
                    RetrievalQuery(query_text=query_text, top_k=5)
                )
            except Exception as e:
                logger.error(f"ScoringEngine dense retrieval failed: {e}")
                
        # 1. Novelty
        novelty_score = calculate_novelty(retrieval_results, state=state)
        
        # 2. Market Saturation
        competition_data = state.get("competition_findings")
        comp_findings = CompetitionFindings(**competition_data) if competition_data else None
        saturation_score = calculate_saturation(comp_findings, state=state)
        
        # 3. Market Pain
        research_data = state.get("research_findings")
        res_findings = ResearchFindings(**research_data) if research_data else None
        pain_score = calculate_market_pain(res_findings, state=state)
        
        # 4. Feasibility
        feasibility_score = calculate_feasibility(state)
        
        # 5. Opportunity
        opportunity_score = calculate_opportunity(novelty_score, pain_score)
        
        # 6. Risk
        risk_score = calculate_risk(saturation_score, feasibility_score, novelty_score)
        
        scores = {
            "novelty": novelty_score,
            "saturation": saturation_score,
            "market_pain": pain_score,
            "feasibility": feasibility_score,
            "opportunity": opportunity_score,
            "risk": risk_score
        }
        
        return scores
