"""
Tests for LLM Circuit Breaker.
"""

import pytest
import time
from backend.llm.circuit_breaker import CircuitBreakerManager, CircuitState


@pytest.mark.asyncio
async def test_circuit_breaker_transitions() -> None:
    cb = CircuitBreakerManager(failure_threshold=2, recovery_timeout_seconds=0.2)

    # Initial state: CLOSED
    assert await cb.get_state("groq") == CircuitState.CLOSED

    # 1 failure -> still CLOSED
    await cb.record_failure("groq", "transient error")
    assert await cb.get_state("groq") == CircuitState.CLOSED

    # 2 failures -> trips to OPEN
    await cb.record_failure("groq", "second failure")
    assert await cb.get_state("groq") == CircuitState.OPEN

    # Other provider (gemini) remains CLOSED
    assert await cb.get_state("gemini") == CircuitState.CLOSED

    # Wait for recovery timeout
    import asyncio
    await asyncio.sleep(0.25)

    # State transitions to HALF_OPEN
    assert await cb.get_state("groq") == CircuitState.HALF_OPEN

    # Probe success -> resets to CLOSED
    await cb.record_success("groq")
    assert await cb.get_state("groq") == CircuitState.CLOSED

