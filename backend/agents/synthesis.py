"""
DIME Backend - Synthesis Agent (Phase 10).
"""

import json
from backend.agents.models import SynthesisResult
from backend.agents.provider import LLMProvider
from backend.agents.prompts import SYNTHESIS_PROMPT
from typing import Any


class SynthesisAgent:
    """
    Combines the AnalysisPlan, ResearchFindings, and CompetitionFindings into a final summary.
    """
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def synthesize(
        self, 
        plan: dict[str, Any], 
        research_findings: dict[str, Any], 
        competition_findings: dict[str, Any]
    ) -> SynthesisResult:
        """
        Generates the synthesis from the raw state dictionaries.
        """
        # Ensure we can serialize the state objects correctly
        plan_str = json.dumps(plan, indent=2) if plan else "{}"
        research_str = json.dumps(research_findings, indent=2) if research_findings else "{}"
        comp_str = json.dumps(competition_findings, indent=2) if competition_findings else "{}"

        prompt = f"""
[ANALYSIS PLAN]
{plan_str}

[RESEARCH FINDINGS]
{research_str}

[COMPETITION FINDINGS]
{comp_str}

Please generate the SynthesisResult. Do NOT invent new findings. Do NOT score the idea.
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=SynthesisResult,
            system_prompt=SYNTHESIS_PROMPT
        )
