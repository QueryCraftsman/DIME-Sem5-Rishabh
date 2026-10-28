"""
DIME Backend - Research Agent (Phase 10).
"""

import asyncio
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

    async def _retrieve_for_question(self, question: str) -> list:
        """Retrieves evidence for a question using the session-bound retrieval service."""
        query = RetrievalQuery(
            query_text=question,
            top_k=self.settings.agent_retrieval_top_k
        )
        return await self.retrieval_service.retrieve(query)

    async def _generate_for_question(self, question: str, results: list) -> ResearchFindings:
        """Formats evidence and calls the LLM with structured outputs."""
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
        raw_findings = await self.provider.structured_generate(
            prompt=prompt,
            response_model=ResearchFindings,
            system_prompt=RESEARCH_PROMPT
        )

        validated_findings = []
        for finding in raw_findings.findings:
            valid_refs = [ref for ref in finding.evidence_references if ref in valid_chunk_ids]
            
            if finding.qualification in ("supported", "inferred") and not valid_refs:
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
        Retrieval is executed safely on the session, then LLM generation is parallelized.
        """
        questions_to_process = research_questions[:self.settings.agent_max_research_questions]
        if not questions_to_process:
            return ResearchFindings(findings=[], unresolved_questions=[])

        # 1. Sequential retrieval (prevents SQLAlchemy session concurrency conflicts)
        retrieval_pairs = []
        for q in questions_to_process:
            try:
                res = await self._retrieve_for_question(q)
                retrieval_pairs.append((q, res))
            except Exception as e:
                logger.error(f"Error retrieving for '{q}': {e}")
                retrieval_pairs.append((q, []))

        # 2. Concurrent LLM generation (massively speeds up the slowest step)
        tasks = [self._generate_for_question(q, res) for q, res in retrieval_pairs]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_findings = []
        all_unresolved = []

        for (q, _), res in zip(retrieval_pairs, results):
            if isinstance(res, Exception):
                logger.error(f"Error researching question '{q}': {res}")
                all_unresolved.append(q)
            elif isinstance(res, ResearchFindings):
                all_findings.extend(res.findings)
                all_unresolved.extend(res.unresolved_questions)

        return ResearchFindings(
            findings=all_findings,
            unresolved_questions=all_unresolved
        )
