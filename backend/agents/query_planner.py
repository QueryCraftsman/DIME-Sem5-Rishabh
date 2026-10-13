"""
DIME Backend - Query Planner Agent.

Generates source-specific query families from a StructuredIdea.
This is Step 3-4 of the pipeline overhaul.
"""

import logging
from typing import Any

from backend.agents.models import StructuredIdea, QueryPlan
from backend.agents.provider import LLMProvider

logger = logging.getLogger(__name__)

QUERY_PLANNER_PROMPT = """\
You are an expert search query planner for the DIME product intelligence platform.
Your task is to generate search queries optimized for different data sources.

Rules:
1. Generate 4-6 GitHub queries focused on finding repositories, implementations, 
   competitors, and open-source projects. Use GitHub search syntax (e.g., "in:readme,description").
2. Generate 3-5 paper queries focused on academic research, methods, algorithms,
   and empirical studies.
3. Generate 3-5 web queries focused on product pages, competitor documentation,
   market analysis, and technical documentation.
4. Generate negative_keywords that indicate IRRELEVANT results (e.g., "awesome list",
   "media streaming" for a resume matcher idea).
5. Each query MUST have a clear intent: primary, problem, domain, technical, product, or competition.
6. Each query MUST have a priority (0.0-1.0) indicating importance.
7. DO NOT generate generic queries like "AI project" or "machine learning".
8. DO NOT use the same query for all sources. Tailor queries to each source type.
9. Output ONLY valid JSON matching the schema.
"""


class QueryPlanner:
    """Generates source-specific search queries from a StructuredIdea."""

    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def plan_queries(self, idea: dict[str, Any], structured_idea: StructuredIdea) -> QueryPlan:
        """Generate source-specific query families."""
        prompt = f"""\
[USER IDEA]
Title: {idea.get('title', 'N/A')}
Description: {idea.get('description', 'N/A')}

[STRUCTURED ANALYSIS]
Problem: {structured_idea.problem}
Domain: {structured_idea.domain}
Product Type: {structured_idea.product_type}
Target Users: {', '.join(structured_idea.target_users)}
Core Capabilities: {', '.join(structured_idea.core_capabilities)}
Technical Concepts: {', '.join(structured_idea.technical_concepts)}
Market Terms: {', '.join(structured_idea.market_terms)}
Differentiators: {', '.join(structured_idea.differentiators)}

Generate a QueryPlan with:
- github_queries: 4-6 queries optimized for GitHub search (repositories, code, implementations).
  Use "in:readme,description" syntax. Focus on finding competitors and implementations.
- paper_queries: 3-5 queries optimized for academic paper search (Semantic Scholar, Crossref).
  Focus on research methods, algorithms, empirical studies.
- web_queries: 3-5 queries optimized for web search (product pages, documentation, market data).
  Focus on existing products, market information, competitor features.
- negative_keywords: list of terms that would indicate IRRELEVANT results for this specific idea.
"""
        return await self.provider.structured_generate(
            prompt=prompt,
            response_model=QueryPlan,
            system_prompt=QUERY_PLANNER_PROMPT,
        )
