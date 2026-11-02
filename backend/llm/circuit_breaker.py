"""
DIME Centralized LLM Architecture — Circuit Breaker (Phase 5).
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from enum import Enum
from typing import Any

from backend.core.cache import cache_manager

logger = logging.getLogger("dime.llm.circuit_breaker")


class CircuitState(str, Enum):
    """Circuit breaker states."""
    CLOSED = "closed"       # Normal operation
    OPEN = "open"           # Tripped; traffic halted
    HALF_OPEN = "half_open" # Probe allowed


class CircuitBreakerManager:
    """
    Provider-specific circuit breaker manager.
    Prevents hammering failing providers while allowing controlled recovery probes.
    Syncs state across Redis with local memory fallback.
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 60.0,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self._local_state: dict[str, dict[str, Any]] = {}

    def _redis_key(self, provider: str) -> str:
        return f"llm:circuit:{provider.lower()}"

    async def get_state(self, provider: str) -> CircuitState:
        """Determines the current circuit breaker state for a provider."""
        prov_key = provider.lower()
        now = time.time()
        record: dict[str, Any] | None = None

        # 1. Check Redis with 0.5s timeout
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                val = await asyncio.wait_for(
                    cache_manager.redis.get(self._redis_key(prov_key)),
                    timeout=0.5,
                )
                if val:
                    record = json.loads(val)
        except Exception:
            pass

        # 2. Check local fallback if Redis empty
        if record is None:
            record = self._local_state.get(prov_key, {
                "state": CircuitState.CLOSED.value,
                "consecutive_failures": 0,
                "tripped_at": 0.0,
                "last_success": 0.0,
            })

        curr_state = CircuitState(record.get("state", CircuitState.CLOSED.value))

        if curr_state == CircuitState.OPEN:
            tripped_at = record.get("tripped_at", 0.0)
            if now - tripped_at >= self.recovery_timeout_seconds:
                # Transition to HALF_OPEN to allow a single probe request
                curr_state = CircuitState.HALF_OPEN
                record["state"] = curr_state.value
                await self._persist_record(prov_key, record)
                logger.info(f"[Circuit Breaker] Provider '{provider}' transitioned from OPEN to HALF_OPEN.")

        return curr_state

    async def record_success(self, provider: str) -> None:
        """Records a successful request, resetting failures and closing circuit."""
        prov_key = provider.lower()
        record = {
            "state": CircuitState.CLOSED.value,
            "consecutive_failures": 0,
            "tripped_at": 0.0,
            "last_success": time.time(),
        }
        await self._persist_record(prov_key, record)

    async def record_failure(self, provider: str, error_msg: str = "") -> None:
        """Records an execution failure, incrementing failure counter and tripping if threshold met."""
        prov_key = provider.lower()
        state = await self.get_state(provider)
        now = time.time()

        record = await self._get_record(prov_key)
        failures = record.get("consecutive_failures", 0) + 1
        record["consecutive_failures"] = failures

        if state == CircuitState.HALF_OPEN or failures >= self.failure_threshold:
            record["state"] = CircuitState.OPEN.value
            record["tripped_at"] = now
            record["last_error"] = error_msg[:150]
            logger.warning(
                f"[Circuit Breaker] Tripped to OPEN for provider '{provider}' ({failures} failures). Cooldown: {self.recovery_timeout_seconds}s."
            )
        else:
            record["state"] = CircuitState.CLOSED.value

        await self._persist_record(prov_key, record)

    async def _get_record(self, prov_key: str) -> dict[str, Any]:
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                val = await asyncio.wait_for(
                    cache_manager.redis.get(self._redis_key(prov_key)),
                    timeout=0.5,
                )
                if val:
                    return json.loads(val)
        except Exception:
            pass

        return self._local_state.get(prov_key, {
            "state": CircuitState.CLOSED.value,
            "consecutive_failures": 0,
            "tripped_at": 0.0,
            "last_success": 0.0,
        })

    async def _persist_record(self, prov_key: str, record: dict[str, Any]) -> None:
        self._local_state[prov_key] = record
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                await asyncio.wait_for(
                    cache_manager.redis.set(
                        self._redis_key(prov_key),
                        json.dumps(record),
                        ex=int(self.recovery_timeout_seconds * 3),
                    ),
                    timeout=0.5,
                )
        except Exception:
            pass


# Global singleton circuit breaker
circuit_breaker = CircuitBreakerManager()
