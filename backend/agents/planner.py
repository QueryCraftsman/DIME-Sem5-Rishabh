"""
DIME Backend - Planner Agent (Phase 10).
"""

import json
from backend.agents.models import AnalysisPlan
from backend.agents.provider import LLMProvider
from backend.agents.prompts import PLANNER_PROMPT
from typing import Any


class PlannerAgent:
    """
    Transforms a user idea into a bounded AnalysisPlan.
    """
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider
        self.settings = provider.settings

    async def plan(self, idea: dict[str, Any]) -> AnalysisPlan:
        """
        Generates the analysis plan based on the user's idea.
        """
        # Construct the user prompt
        prompt = f"""
[USER IDEA]
Title: {idea.get('title', 'N/A')}
Description: {idea.get('description', 'N/A')}
Domain: {idea.get('domain', 'N/A')}
Target Audience: {idea.get('target_audience', 'N/A')}

Generate an AnalysisPlan for this idea.
Limit your output to a maximum of {self.settings.agent_max_research_questions} research questions.
Limit your output to a maximum of {self.settings.agent_max_competitor_questions} competitor questions.
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=AnalysisPlan,
            system_prompt=PLANNER_PROMPT
        )
