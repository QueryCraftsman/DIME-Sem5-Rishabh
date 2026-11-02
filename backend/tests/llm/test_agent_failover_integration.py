"""
Integration tests verifying multi-provider failover across DIME agents and services.
"""

from unittest.mock import AsyncMock, MagicMock
import pytest
import httpx

from backend.agents.models import AnalysisPlan, StructuredIdea, SynthesisResult, ResearchFindings, ResearchFinding
from backend.agents.planner import PlannerAgent
from backend.agents.idea_analyzer import IdeaAnalyzer
from backend.agents.synthesis import SynthesisAgent
from backend.agents.provider import LLMProvider
from backend.llm.config import Capability
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.provider_router import LLMRouter
from backend.services.idea_extractor import IdeaExtractionService
from backend.schemas.idea_submission import NaturalLanguageIdeaRequest, BuilderChatRequest, BuilderChatMessage


class MockProvider(BaseLLMProvider):
    def __init__(self, name: str) -> None:
        self.name = name
        self.model_name = f"{name}-model"
        self.capabilities = {Capability.TEXT, Capability.JSON_MODE, Capability.STRUCTURED_OUTPUT}
        self.generate_structured_mock = AsyncMock()
        self.generate_text_mock = AsyncMock()

    def is_configured(self) -> bool:
        return True

    async def generate_text(self, *args, **kwargs) -> str:
        return await self.generate_text_mock(*args, **kwargs)

    async def generate_structured(self, *args, **kwargs):
        return await self.generate_structured_mock(*args, **kwargs)

    async def health_check(self) -> bool:
        return True


@pytest.fixture
def agent_test_env():
    from backend.llm.rate_limit_manager import RateLimitManager
    from backend.llm.circuit_breaker import CircuitBreakerManager

    router = LLMRouter()
    groq = MockProvider("groq")
    gemini = MockProvider("gemini")
    nvidia = MockProvider("nvidia")

    router.registry._providers = {
        "groq": groq,
        "gemini": gemini,
        "nvidia": nvidia,
    }
    router.rate_limit_mgr = RateLimitManager(default_cooldown_seconds=10.0)
    router.circuit_breaker_mgr = CircuitBreakerManager(failure_threshold=2, recovery_timeout_seconds=0.2)
    provider = LLMProvider(router=router)
    return provider, groq, gemini, nvidia


@pytest.mark.asyncio
async def test_planner_agent_fails_over_to_gemini(agent_test_env) -> None:
    provider, groq, gemini, nvidia = agent_test_env
    agent = PlannerAgent(provider)

    # Groq returns 429
    req = httpx.Request("POST", "https://api.groq.com")
    resp = httpx.Response(status_code=429, headers={"Retry-After": "60"}, request=req)
    groq.generate_structured_mock.side_effect = httpx.HTTPStatusError("429 Rate limited", request=req, response=resp)

    # Gemini returns valid AnalysisPlan
    expected_plan = AnalysisPlan(
        objectives=["Assess automated logistics"],
        research_questions=["What is the average reverse logistics return cost?"],
        competitor_questions=["Who are leading B2B reverse logistics SaaS?"],
        evidence_requirements=["Unit cost benchmarks"],
    )
    gemini.generate_structured_mock.return_value = expected_plan

    plan = await agent.plan({"title": "Reverse Logistics Automation", "description": "Automate returns"})

    assert plan == expected_plan
    groq.generate_structured_mock.assert_called_once()
    gemini.generate_structured_mock.assert_called_once()


@pytest.mark.asyncio
async def test_idea_analyzer_fails_over_to_nemotron(agent_test_env) -> None:
    provider, groq, gemini, nvidia = agent_test_env
    analyzer = IdeaAnalyzer(provider)

    # Groq times out
    groq.generate_structured_mock.side_effect = TimeoutError("Groq timeout")

    # Gemini throws 503
    req = httpx.Request("POST", "https://gemini.googleapis.com")
    resp = httpx.Response(status_code=503, request=req)
    gemini.generate_structured_mock.side_effect = httpx.HTTPStatusError("503 Overloaded", request=req, response=resp)

    # Nvidia Nemotron succeeds
    expected_structured = StructuredIdea(
        problem="High return friction in e-commerce",
        domain="LogisticsTech",
        target_users=["E-commerce Operations Managers"],
        product_type="SaaS Platform",
        core_capabilities=["Automated label generation", "Carrier routing"],
        technical_concepts=["Route optimization", "REST APIs"],
        market_terms=["Reverse logistics", "RMA automation"],
        differentiators=["Instant customer refund routing"],
    )
    nvidia.generate_structured_mock.return_value = expected_structured

    result = await analyzer.analyze({"title": "ReturnFlow", "description": "Automated returns for Shopify"})

    assert result == expected_structured
    assert nvidia.generate_structured_mock.call_count == 1


@pytest.mark.asyncio
async def test_synthesis_agent_executes_on_primary_groq(agent_test_env) -> None:
    provider, groq, gemini, nvidia = agent_test_env
    synthesizer = SynthesisAgent(provider)

    expected_synthesis = SynthesisResult(
        key_findings=["Solid enterprise SaaS market with existing competitors."],
        market_observations=["Growing demand for automated logistics."],
        competitor_observations=["Two primary enterprise players identified."],
        evidence_references=["doc_1", "doc_2"],
        uncertainties=["Regional carrier pricing variance."],
    )
    groq.generate_structured_mock.return_value = expected_synthesis

    res = await synthesizer.synthesize(
        plan={"objectives": ["Test"]},
        research_findings={"findings": []},
        competition_findings={"competitors": []},
    )

    assert res == expected_synthesis
    groq.generate_structured_mock.assert_called_once()
    gemini.generate_structured_mock.assert_not_called()


@pytest.mark.asyncio
async def test_idea_extraction_service_chat_builder_with_failover(agent_test_env) -> None:
    provider, groq, gemini, nvidia = agent_test_env
    service = IdeaExtractionService(provider)

    # Groq fails with 500
    req = httpx.Request("POST", "https://api.groq.com")
    resp = httpx.Response(status_code=500, request=req)
    groq.generate_structured_mock.side_effect = httpx.HTTPStatusError("500", request=req, response=resp)

    from backend.schemas.idea_submission import BuilderChatResponse
    expected_reply = BuilderChatResponse(
        message="That sounds promising! Who will be your primary customers?",
        suggested_questions=["Enterprise retail chains", "Independent Shopify merchants"],
        is_ready_for_validation=False,
    )
    gemini.generate_structured_mock.return_value = expected_reply

    reply = await service.chat_builder(
        BuilderChatRequest(
            messages=[BuilderChatMessage(role="user", content="I want to build a returns platform")],
        )
    )

    assert reply.message == expected_reply.message
    assert gemini.generate_structured_mock.call_count == 1
