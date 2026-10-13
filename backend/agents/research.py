"""
DIME Backend - Research Agent (Phase 10).
"""

import logging
from backend.agents.models import ResearchFindings, ResearchFinding
from backend.agents.provider import LLMProvider
from backend.agents.prompts import RESEARCH_PROMPT
from backend.core.retrieval.service import RetrievalService
from backend.core.retrieval.models import RetrievalQuery

logger = logging.getLogger(__name__)


class ResearchAgent:
    """
    Answers research questions using retrieved evidence and enforces programmatic grounding.
    """
    def __init__(self, provider: LLMProvider, retrieval_service: RetrievalService) -> None:
        self.provider = provider
        self.settings = provider.settings
        self.retrieval_service = retrieval_service

    async def _research_single_question(self, question: str) -> ResearchFindings:
        """
        Retrieves evidence for a single question and gets structured findings from the LLM.
        """
        # 1. Retrieve evidence
        query = RetrievalQuery(
            query_text=question,
            top_k=self.settings.agent_retrieval_top_k
        )
        results = await self.retrieval_service.retrieve(query)
        
        valid_chunk_ids = {r.chunk_id for r in results}
        
        if not results:
            return ResearchFindings(
                findings=[
                    ResearchFinding(
                        finding="No relevant evidence could be retrieved for this question.",
                        evidence_references=[],
                        qualification="insufficient_evidence"
                    )
                ],
                unresolved_questions=[question]
            )

        # 2. Format evidence for the prompt
        evidence_text = "\n".join(
            f"---\nChunk ID: {r.chunk_id}\nTitle: {r.title or 'Unknown'}\nContent: {r.text}\n---"
            for r in results if r.text
        )

        prompt = f"""
[RESEARCH QUESTION]
{question}

[RETRIEVED EVIDENCE]
{evidence_text}
"""

        # 3. Generate structured response
        raw_findings = await self.provider.structured_generate(
            prompt=prompt,
            response_model=ResearchFindings,
            system_prompt=RESEARCH_PROMPT
        )

        # 4. Programmatic Validation (Grounding)
        validated_findings = []
        for finding in raw_findings.findings:
            # Filter out invalid chunk IDs hallucinated by the LLM
            valid_refs = [ref for ref in finding.evidence_references if ref in valid_chunk_ids]
            
            if finding.qualification in ("supported", "inferred") and not valid_refs:
                # If stated as fact but no valid evidence exists, downgrade qualification
                logger.warning(f"Downgrading finding due to hallucinated/missing evidence: {finding.finding}")
                finding.qualification = "insufficient_evidence"
                finding.finding = f"(Unsupported claim rejected) Original claim: {finding.finding}"
            
            finding.evidence_references = valid_refs
            validated_findings.append(finding)

        raw_findings.findings = validated_findings
        return raw_findings

    async def research(self, research_questions: list[str]) -> ResearchFindings:
        """
        Processes a list of research questions.
        """
        all_findings = []
        all_unresolved = []
        
        for idx, question in enumerate(research_questions):
            if idx >= self.settings.agent_max_research_questions:
                break
                
            try:
                result = await self._research_single_question(question)
                all_findings.extend(result.findings)
                all_unresolved.extend(result.unresolved_questions)
            except Exception as e:
                logger.error(f"Error researching question '{question}': {e}")
                all_unresolved.append(question)
                
        return ResearchFindings(
            findings=all_findings,
            unresolved_questions=all_unresolved
        )
