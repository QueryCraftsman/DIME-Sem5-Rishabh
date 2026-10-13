"""
DIME Backend - Competition Agent (Phase 10).
"""

import logging
from backend.agents.models import CompetitionFindings, CompetitionFinding
from backend.agents.provider import LLMProvider
from backend.agents.prompts import COMPETITION_PROMPT
from backend.core.retrieval.service import RetrievalService
from backend.core.retrieval.models import RetrievalQuery
from typing import Any

logger = logging.getLogger(__name__)


class CompetitionAgent:
    """
    Identifies and analyzes competitors or similar existing solutions based on evidence.
    """
    def __init__(self, provider: LLMProvider, retrieval_service: RetrievalService) -> None:
        self.provider = provider
        self.settings = provider.settings
        self.retrieval_service = retrieval_service

    async def _analyze_single_competitor_question(self, idea: dict[str, Any], question: str) -> CompetitionFindings:
        """
        Retrieves evidence focused on existing solutions and gets structured findings from the LLM.
        """
        # 1. Retrieve evidence
        query = RetrievalQuery(
            query_text=question,
            top_k=self.settings.agent_retrieval_top_k
        )
        results = await self.retrieval_service.retrieve(query)
        
        valid_chunk_ids = {r.chunk_id for r in results}
        
        if not results:
            return CompetitionFindings(
                competitors=[],
                gaps=[f"No evidence found for competitive question: {question}"]
            )

        # 2. Format evidence
        evidence_text = "\n".join(
            f"---\nChunk ID: {r.chunk_id}\nTitle: {r.title or 'Unknown'}\nContent: {r.text}\n---"
            for r in results if r.text
        )

        prompt = f"""
[USER IDEA]
Title: {idea.get('title', 'N/A')}
Description: {idea.get('description', 'N/A')}

[COMPETITION QUESTION]
{question}

[RETRIEVED EVIDENCE]
{evidence_text}
"""

        # 3. Generate structured response
        raw_findings = await self.provider.structured_generate(
            prompt=prompt,
            response_model=CompetitionFindings,
            system_prompt=COMPETITION_PROMPT
        )

        # 4. Programmatic Validation (Grounding)
        validated_competitors = []
        for comp in raw_findings.competitors:
            # Filter out invalid chunk IDs
            valid_refs = [ref for ref in comp.evidence_references if ref in valid_chunk_ids]
            
            if not valid_refs:
                logger.warning(f"Discarding competitor '{comp.competitor}' due to missing evidence.")
                continue
                
            comp.evidence_references = valid_refs
            validated_competitors.append(comp)

        raw_findings.competitors = validated_competitors
        return raw_findings

    async def analyze_competition(self, idea: dict[str, Any], competitor_questions: list[str]) -> CompetitionFindings:
        """
        Processes a list of competition analysis questions.
        """
        all_competitors = []
        all_gaps = []
        
        for idx, question in enumerate(competitor_questions):
            if idx >= self.settings.agent_max_competitor_questions:
                break
                
            try:
                result = await self._analyze_single_competitor_question(idea, question)
                all_competitors.extend(result.competitors)
                all_gaps.extend(result.gaps)
            except Exception as e:
                logger.error(f"Error analyzing competitive question '{question}': {e}")
                all_gaps.append(f"Failed to analyze question: {question}")
                
        # Simple deduplication by competitor name to keep findings cleaner
        seen = set()
        dedup_competitors = []
        for comp in all_competitors:
            name_lower = comp.competitor.lower().strip()
            if name_lower not in seen:
                seen.add(name_lower)
                dedup_competitors.append(comp)
                
        return CompetitionFindings(
            competitors=dedup_competitors,
            gaps=all_gaps
        )
