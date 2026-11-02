"""
DIME Backend - LLM Provider (Phase 10 & Centralized Failover).

Provides seamless backward-compatible interface for all agents and services
while delegating directly to the centralized multi-provider LLM router.
"""

from __future__ import annotations

import logging
from typing import TypeVar, Type, Any

from pydantic import BaseModel

from backend.core.config import get_settings
from backend.llm.provider_router import get_llm_router, LLMRouter
from backend.llm.response_validator import ResponseValidator

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMProvider:
    """
    Centralized LLM Provider adapter used across all DIME AI agents and services.
    Transparently executes requests through DIME's Multi-Provider LLM Router with:
    - Configured Priority: Groq (Primary) -> Gemini (Fallback 1) -> OpenRouter / Nemotron (Fallback 2)
    - Shared Redis Rate-Limit Cooldown across Celery workers
    - Provider-Specific Circuit Breakers (CLOSED / OPEN / HALF_OPEN)
    - Automatic Error Classification & Bounded Exponential Retries
    - Strict Schema Validation & Sanitized Observability Telemetry
    """

    def __init__(self, router: LLMRouter | None = None) -> None:
        self.settings = get_settings()
        self.router = router or get_llm_router()
        self.provider_name = self.settings.llm_primary_provider.lower()
        self.model_name = self.settings.llm_model_name
        self.temperature = self.settings.llm_temperature

    def _extract_model_from_text(self, text: str, response_model: Type[T]) -> T:
        """Backward-compatible helper to extract and validate Pydantic model from raw text."""
        return ResponseValidator.validate_structured(text, response_model)

    async def structured_generate(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: str = "You are an analytical AI assistant.",
        agent_name: str = "agent",
        analysis_id: str | None = None,
        task_id: str | None = None,
        temperature: float | None = None,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> T:
        """
        Generates a structured Pydantic response with automatic multi-provider failover
        across Groq -> Gemini -> OpenRouter Nemotron -> OpenAI.
        """
        temp = temperature if temperature is not None else self.temperature
        return await self.router.execute_structured(
            prompt=prompt,
            response_model=response_model,
            system_prompt=system_prompt,
            temperature=temp,
            agent_name=agent_name,
            analysis_id=analysis_id,
            task_id=task_id,
            timeout_seconds=timeout_seconds,
        )

    async def text_generate(
        self,
        prompt: str,
        system_prompt: str = "You are an analytical AI assistant.",
        agent_name: str = "agent",
        analysis_id: str | None = None,
        task_id: str | None = None,
        temperature: float | None = None,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> str:
        """
        Generates raw text completion with automatic multi-provider failover.
        """
        temp = temperature if temperature is not None else self.temperature
        return await self.router.execute_text(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temp,
            agent_name=agent_name,
            analysis_id=analysis_id,
            task_id=task_id,
            timeout_seconds=timeout_seconds,
        )
