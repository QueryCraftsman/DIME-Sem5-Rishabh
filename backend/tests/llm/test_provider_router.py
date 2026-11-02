"""
Unit & failover tests for LLMRouter.
"""

import asyncio
from unittest.mock import AsyncMock, patch
import pytest
from pydantic import BaseModel
import httpx

from backend.llm.config import Capability
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.provider_router import LLMRouter, AllProvidersExhaustedError
from backend.llm.circuit_breaker import CircuitBreakerManager, CircuitState
from backend.llm.rate_limit_manager import RateLimitManager


class SimpleResult(BaseModel):
    message: str
    code: int


class MockProvider(BaseLLMProvider):
    def __init__(self, name: str, is_configured: bool = True) -> None:
        self.name = name
        self.model_name = f"{name}-test-model"
        self._is_configured = is_configured
        self.capabilities = {Capability.TEXT, Capability.JSON_MODE, Capability.STRUCTURED_OUTPUT}
        self.generate_structured_mock = AsyncMock()
        self.generate_text_mock = AsyncMock()

    def is_configured(self) -> bool:
        return self._is_configured

    async def generate_text(self, *args, **kwargs) -> str:
        return await self.generate_text_mock(*args, **kwargs)

    async def generate_structured(self, *args, **kwargs):
        return await self.generate_structured_mock(*args, **kwargs)

    async def health_check(self) -> bool:
        return True


@pytest.fixture
def mock_router() -> tuple[LLMRouter, MockProvider, MockProvider, MockProvider]:
    router = LLMRouter()
    groq = MockProvider("groq")
    gemini = MockProvider("gemini")
    nvidia = MockProvider("nvidia")

    # Replace providers in registry
    router.registry._providers = {
        "groq": groq,
        "gemini": gemini,
        "nvidia": nvidia,
    }
    router.rate_limit_mgr = RateLimitManager(default_cooldown_seconds=10.0)
    router.circuit_breaker_mgr = CircuitBreakerManager(failure_threshold=2, recovery_timeout_seconds=0.2)
    return router, groq, gemini, nvidia


@pytest.mark.asyncio
async def test_primary_groq_succeeds(mock_router) -> None:
    router, groq, gemini, nvidia = mock_router
    expected = SimpleResult(message="Groq primary success", code=200)
    groq.generate_structured_mock.return_value = expected

    res = await router.execute_structured(
        prompt="Test prompt",
        response_model=SimpleResult,
        agent_name="TestAgent",
    )

    assert res == expected
    groq.generate_structured_mock.assert_called_once()
    gemini.generate_structured_mock.assert_not_called()
    nvidia.generate_structured_mock.assert_not_called()


@pytest.mark.asyncio
async def test_groq_429_fails_over_to_gemini(mock_router) -> None:
    router, groq, gemini, nvidia = mock_router
    
    # Groq throws 429
    req = httpx.Request("POST", "https://api.groq.com")
    resp = httpx.Response(status_code=429, headers={"Retry-After": "30"}, request=req)
    groq.generate_structured_mock.side_effect = httpx.HTTPStatusError("Rate limit", request=req, response=resp)

    # Gemini succeeds
    expected = SimpleResult(message="Gemini fallback 1 success", code=200)
    gemini.generate_structured_mock.return_value = expected

    res = await router.execute_structured(
        prompt="Test prompt",
        response_model=SimpleResult,
        agent_name="TestAgent",
    )

    assert res == expected
    groq.generate_structured_mock.assert_called_once()
    gemini.generate_structured_mock.assert_called_once()
    nvidia.generate_structured_mock.assert_not_called()

    # Verify Groq entered cooldown
    assert await router.rate_limit_mgr.is_in_cooldown("groq") is True


@pytest.mark.asyncio
async def test_groq_and_gemini_fail_fails_over_to_nvidia(mock_router) -> None:
    router, groq, gemini, nvidia = mock_router
    
    # Groq throws 503
    req1 = httpx.Request("POST", "https://api.groq.com")
    resp1 = httpx.Response(status_code=503, request=req1)
    groq.generate_structured_mock.side_effect = httpx.HTTPStatusError("503", request=req1, response=resp1)

    # Gemini throws 500
    req2 = httpx.Request("POST", "https://gemini.googleapis.com")
    resp2 = httpx.Response(status_code=500, request=req2)
    gemini.generate_structured_mock.side_effect = httpx.HTTPStatusError("500", request=req2, response=resp2)

    # Nvidia / OpenRouter succeeds
    expected = SimpleResult(message="Nemotron fallback 2 success", code=200)
    nvidia.generate_structured_mock.return_value = expected

    res = await router.execute_structured(
        prompt="Test prompt",
        response_model=SimpleResult,
        agent_name="TestAgent",
    )

    assert res == expected
    nvidia.generate_structured_mock.assert_called_once()


@pytest.mark.asyncio
async def test_all_providers_fail_raises_exception(mock_router) -> None:
    router, groq, gemini, nvidia = mock_router
    
    groq.generate_structured_mock.side_effect = Exception("Groq down")
    gemini.generate_structured_mock.side_effect = Exception("Gemini down")
    nvidia.generate_structured_mock.side_effect = Exception("Nvidia down")

    with pytest.raises(AllProvidersExhaustedError) as exc_info:
        await router.execute_structured(
            prompt="Test prompt",
            response_model=SimpleResult,
            agent_name="TestAgent",
        )
    assert "All configured LLM providers failed" in str(exc_info.value)


@pytest.mark.asyncio
async def test_circuit_breaker_tripped_skips_provider(mock_router) -> None:
    router, groq, gemini, nvidia = mock_router

    # Trip groq circuit breaker
    await router.circuit_breaker_mgr.record_failure("groq")
    await router.circuit_breaker_mgr.record_failure("groq")
    assert await router.circuit_breaker_mgr.get_state("groq") == CircuitState.OPEN

    # Gemini succeeds
    expected = SimpleResult(message="Gemini success", code=200)
    gemini.generate_structured_mock.return_value = expected

    res = await router.execute_structured(
        prompt="Test prompt",
        response_model=SimpleResult,
        agent_name="TestAgent",
    )

    assert res == expected
    # Groq was skipped without even being invoked
    groq.generate_structured_mock.assert_not_called()
    gemini.generate_structured_mock.assert_called_once()

