"""
DIME Backend - Idea Analyzer Agent.

Parses a user's raw idea into a structured representation before
any external queries are made. This is Step 2 of the pipeline overhaul.
"""

import logging
from typing import Any

from backend.agents.models import StructuredIdea
from backend.agents.provider import LLMProvider

logger = logging.getLogger(__name__)

IDEA_ANALYZER_PROMPT = """\
You are an expert product analyst for the DIME platform.
Your task is to analyze a user's product idea and produce a structured representation.

Rules:
1. Extract the CORE PROBLEM, not a restatement of the idea title.
2. Identify the specific DOMAIN and INDUSTRY.
3. List concrete TARGET USERS (not generic "everyone").
4. List specific TECHNICAL CONCEPTS that would be used to build this.
5. List MARKET TERMS that professionals in this space would search for.
6. List what makes this idea DIFFERENT from obvious existing solutions.
7. Be specific and precise. Avoid vague or generic terms.
8. Output ONLY valid JSON matching the schema.
"""


class IdeaAnalyzer:
    """Transforms a raw user idea into a StructuredIdea for downstream query planning."""

    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def analyze(self, idea: dict[str, Any]) -> StructuredIdea:
        """Parse the user's idea into structured form."""
        prompt = f"""\
[USER IDEA]
Title: {idea.get('title', 'N/A')}
Description: {idea.get('description', 'N/A')}
Domain: {idea.get('domain', 'N/A')}
Target Audience: {idea.get('target_audience', 'N/A')}

Analyze this idea and produce a StructuredIdea with:
- problem: the core problem being solved
- domain: the industry/domain
- target_users: list of specific user types
- product_type: what kind of product this is
- core_capabilities: list of key functional capabilities
- technical_concepts: list of technical concepts (algorithms, techniques, etc.)
- market_terms: list of industry search terms
- differentiators: what makes this different from existing solutions
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=StructuredIdea,
            system_prompt=IDEA_ANALYZER_PROMPT,
        )
