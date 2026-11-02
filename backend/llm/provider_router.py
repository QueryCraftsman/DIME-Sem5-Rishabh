"""
DIME Centralized LLM Architecture — Centralized Provider Router (Phase 3 & 9).
"""

from __future__ import annotations

import asyncio
import logging
import random
import time
import uuid
from typing import Type, TypeVar, Any

from pydantic import BaseModel

from backend.core.config import get_settings
from backend.llm.circuit_breaker import circuit_breaker, CircuitState
from backend.llm.config import Capability
from backend.llm.error_classifier import classify_error, ErrorCategory
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.provider_registry import provider_registry
from backend.llm.rate_limit_manager import rate_limit_manager
from backend.llm.response_validator import ResponseValidator, InvalidLLMOutputError
from backend.llm.telemetry import log_attempt, llm_metrics, LLMAttemptLog

logger = logging.getLogger("dime.llm.router")

T = TypeVar("T", bound=BaseModel)


class AllProvidersExhaustedError(RuntimeError):
    """Raised when all configured LLM providers fail to execute the request."""
    pass


class LLMRouter:
    """
    Centralized Multi-Provider LLM Router with Automatic Failover.
    Coordinates sequential provider routing, rate-limit cooldowns, circuit breakers,
    bounded retries, and schema validation.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.registry = provider_registry
        self.rate_limit_mgr = rate_limit_manager
        self.circuit_breaker_mgr = circuit_breaker
        self.metrics = llm_metrics

        # Per-provider concurrency semaphores
        limit = max(1, self.settings.llm_provider_concurrency_limit)
        self._semaphores: dict[str, asyncio.Semaphore] = {
            "groq": asyncio.Semaphore(limit),
            "gemini": asyncio.Semaphore(limit),
            "nvidia": asyncio.Semaphore(limit),
            "openai": asyncio.Semaphore(limit),
        }

    def _get_semaphore(self, provider_name: str) -> asyncio.Semaphore:
        p = provider_name.lower()
        if p not in self._semaphores:
            self._semaphores[p] = asyncio.Semaphore(self.settings.llm_provider_concurrency_limit)
        return self._semaphores[p]

    async def execute_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        request_id: str | None = None,
        agent_name: str = "agent",
        analysis_id: str | None = None,
        task_id: str | None = None,
        timeout_seconds: float | None = None,
    ) -> T:
        """
        Executes an LLM operation expecting a strictly validated Pydantic model output.
        Fails over sequentially across configured providers on rate limits or transient errors.
        """
        req_id = request_id or f"req_{uuid.uuid4().hex[:10]}"
        timeout = timeout_seconds or self.settings.llm_default_timeout_seconds
        candidates = self.registry.get_priority_providers(required_capability=Capability.STRUCTURED_OUTPUT)

        if not candidates:
            raise AllProvidersExhaustedError(
                "No configured and enabled LLM providers found with valid API keys."
            )

        attempt_errors: list[str] = []
        fallback_active = False

        for provider in candidates:
            prov_name = provider.name
            sem = self._get_semaphore(prov_name)

            # 1. Check Rate-Limit Cooldown
            if await self.rate_limit_mgr.is_in_cooldown(prov_name):
                rem = await self.rate_limit_mgr.get_remaining_cooldown(prov_name)
                logger.info(f"[Router] Skipping {prov_name} (in cooldown, remaining: {round(rem, 1)}s).")
                continue

            # 2. Check Circuit Breaker
            cb_state = await self.circuit_breaker_mgr.get_state(prov_name)
            if cb_state == CircuitState.OPEN:
                logger.info(f"[Router] Skipping {prov_name} (circuit breaker is OPEN).")
                continue

            # 3. Attempt execution with bounded retries
            max_retries = max(1, self.settings.llm_max_retries_per_provider)
            provider_succeeded = False

            for attempt_idx in range(1, max_retries + 1):
                start_time = time.perf_counter()
                log_record = LLMAttemptLog(
                    request_id=req_id,
                    agent_name=agent_name,
                    operation_name=f"structured_{response_model.__name__}",
                    provider=prov_name,
                    model=provider.model_name,
                    attempt_number=attempt_idx,
                    analysis_id=analysis_id,
                    task_id=task_id,
                    fallback_triggered=fallback_active,
                    selected_provider=prov_name,
                )

                try:
                    # Concurrency bounded execution
                    async with sem:
                        structured_res = await asyncio.wait_for(
                            provider.generate_structured(
                                prompt=prompt,
                                response_model=response_model,
                                system_prompt=system_prompt,
                                temperature=temperature,
                                timeout_seconds=timeout,
                            ),
                            timeout=timeout + 5.0,  # extra grace
                        )

                    # Successful validation
                    latency_ms = (time.perf_counter() - start_time) * 1000.0
                    log_record.latency_ms = latency_ms
                    log_record.final_status = "success"
                    log_attempt(log_record)
                    self.metrics.record_attempt(log_record)

                    # Update circuit breaker and clear cooldown
                    await self.circuit_breaker_mgr.record_success(prov_name)
                    await self.rate_limit_mgr.clear_cooldown(prov_name)

                    return structured_res

                except Exception as exc:
                    latency_ms = (time.perf_counter() - start_time) * 1000.0
                    classified = classify_error(exc)

                    log_record.latency_ms = latency_ms
                    log_record.failure_category = classified.category
                    log_record.http_status = classified.status_code
                    log_record.error_message = str(exc)
                    log_record.final_status = "failed"
                    log_attempt(log_record)
                    self.metrics.record_attempt(log_record)

                    attempt_errors.append(f"{prov_name} (attempt {attempt_idx}): {classified.category.value} - {classified.message}")

                    # Case A: Rate Limited (429) -> Set cooldown immediately and failover to next provider
                    if classified.category == ErrorCategory.RATE_LIMITED:
                        await self.rate_limit_mgr.set_cooldown(
                            provider=prov_name,
                            duration_seconds=classified.retry_after_seconds or self.settings.llm_provider_cooldown_seconds,
                            reason="http_429",
                        )
                        break  # Stop retrying this provider; fail over immediately

                    # Case B: Authentication error or model not found -> Do not retry, mark circuit open, fail over
                    if classified.category in (ErrorCategory.AUTHENTICATION_ERROR, ErrorCategory.MODEL_UNAVAILABLE):
                        await self.circuit_breaker_mgr.record_failure(prov_name, str(exc))
                        break

                    # Case C: Safety refusal -> Do not attempt on other providers
                    if classified.category == ErrorCategory.SAFETY_REFUSAL:
                        raise ValueError(f"Request refused by provider safety guidelines: {classified.message}")

                    # Case D: Transient failure (503, 5xx, timeout, network, invalid output)
                    if attempt_idx < max_retries and classified.is_retryable_on_same_provider:
                        # Bounded exponential backoff with jitter
                        backoff = min(8.0, (1.5 ** attempt_idx) + random.uniform(0.1, 0.5))
                        logger.debug(f"[Router] Retrying {prov_name} in {round(backoff, 2)}s after {classified.category.value}...")
                        await asyncio.sleep(backoff)
                    else:
                        # Retries exhausted on this provider -> record circuit breaker failure and failover
                        await self.circuit_breaker_mgr.record_failure(prov_name, str(exc))
                        break

            # If this provider didn't succeed, mark fallback active for subsequent candidates
            fallback_active = True
            logger.info(f"[Router] Failing over from '{prov_name}' to next eligible provider.")

        # If all candidates failed
        error_summary = "; ".join(attempt_errors) if attempt_errors else "All candidates were in cooldown or tripped."
        raise AllProvidersExhaustedError(
            f"All configured LLM providers failed for {response_model.__name__}. Details: {error_summary}"
        )

    async def execute_text(
        self,
        prompt: str,
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        request_id: str | None = None,
        agent_name: str = "agent",
        analysis_id: str | None = None,
        task_id: str | None = None,
        timeout_seconds: float | None = None,
    ) -> str:
        """
        Executes a raw completion with automatic provider failover.
        """
        req_id = request_id or f"req_{uuid.uuid4().hex[:10]}"
        timeout = timeout_seconds or self.settings.llm_default_timeout_seconds
        candidates = self.registry.get_priority_providers(required_capability=Capability.TEXT)

        if not candidates:
            raise AllProvidersExhaustedError("No configured LLM providers available.")

        attempt_errors: list[str] = []
        fallback_active = False

        for provider in candidates:
            prov_name = provider.name
            sem = self._get_semaphore(prov_name)

            if await self.rate_limit_mgr.is_in_cooldown(prov_name):
                continue
            if await self.circuit_breaker_mgr.get_state(prov_name) == CircuitState.OPEN:
                continue

            max_retries = max(1, self.settings.llm_max_retries_per_provider)

            for attempt_idx in range(1, max_retries + 1):
                start_time = time.perf_counter()
                log_record = LLMAttemptLog(
                    request_id=req_id,
                    agent_name=agent_name,
                    operation_name="text_completion",
                    provider=prov_name,
                    model=provider.model_name,
                    attempt_number=attempt_idx,
                    analysis_id=analysis_id,
                    task_id=task_id,
                    fallback_triggered=fallback_active,
                    selected_provider=prov_name,
                )

                try:
                    async with sem:
                        text_res = await asyncio.wait_for(
                            provider.generate_text(
                                prompt=prompt,
                                system_prompt=system_prompt,
                                temperature=temperature,
                                timeout_seconds=timeout,
                            ),
                            timeout=timeout + 5.0,
                        )

                    log_record.latency_ms = (time.perf_counter() - start_time) * 1000.0
                    log_record.final_status = "success"
                    log_attempt(log_record)
                    self.metrics.record_attempt(log_record)

                    await self.circuit_breaker_mgr.record_success(prov_name)
                    await self.rate_limit_mgr.clear_cooldown(prov_name)

                    return text_res

                except Exception as exc:
                    latency_ms = (time.perf_counter() - start_time) * 1000.0
                    classified = classify_error(exc)
                    log_record.latency_ms = latency_ms
                    log_record.failure_category = classified.category
                    log_record.http_status = classified.status_code
                    log_record.error_message = str(exc)
                    log_record.final_status = "failed"
                    log_attempt(log_record)
                    self.metrics.record_attempt(log_record)

                    attempt_errors.append(f"{prov_name} (attempt {attempt_idx}): {classified.category.value}")

                    if classified.category == ErrorCategory.RATE_LIMITED:
                        await self.rate_limit_mgr.set_cooldown(
                            provider=prov_name,
                            duration_seconds=classified.retry_after_seconds or self.settings.llm_provider_cooldown_seconds,
                        )
                        break

                    if classified.category in (ErrorCategory.AUTHENTICATION_ERROR, ErrorCategory.MODEL_UNAVAILABLE):
                        await self.circuit_breaker_mgr.record_failure(prov_name, str(exc))
                        break

                    if classified.category == ErrorCategory.SAFETY_REFUSAL:
                        raise ValueError(f"Request refused: {classified.message}")

                    if attempt_idx < max_retries and classified.is_retryable_on_same_provider:
                        await asyncio.sleep(min(8.0, (1.5 ** attempt_idx) + random.uniform(0.1, 0.5)))
                    else:
                        await self.circuit_breaker_mgr.record_failure(prov_name, str(exc))
                        break

            fallback_active = True

        raise AllProvidersExhaustedError(f"All LLM providers failed. Errors: {'; '.join(attempt_errors)}")

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
        """Convenience alias for execute_structured."""
        return await self.execute_structured(
            prompt=prompt,
            response_model=response_model,
            system_prompt=system_prompt,
            temperature=temperature if temperature is not None else 0.0,
            agent_name=agent_name,
            analysis_id=analysis_id,
            task_id=task_id,
            timeout_seconds=timeout_seconds,
        )


# Global singleton router instance
_llm_router: LLMRouter | None = None


def get_llm_router() -> LLMRouter:
    """Returns the cached singleton LLMRouter instance."""
    global _llm_router
    if _llm_router is None:
        _llm_router = LLMRouter()
    return _llm_router

