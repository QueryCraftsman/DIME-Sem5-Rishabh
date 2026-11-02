"""
Tests for LLM Rate Limit & Cooldown Manager.
"""

import asyncio
import pytest
from backend.llm.rate_limit_manager import RateLimitManager


@pytest.mark.asyncio
async def test_rate_limit_cooldown_lifecycle() -> None:
    rlm = RateLimitManager(default_cooldown_seconds=0.2)

    assert await rlm.is_in_cooldown("groq") is False

    await rlm.set_cooldown("groq", duration_seconds=0.2, reason="test_429")
    assert await rlm.is_in_cooldown("groq") is True
    assert await rlm.get_remaining_cooldown("groq") > 0.0

    # Wait for expiration
    await asyncio.sleep(0.25)
    assert await rlm.is_in_cooldown("groq") is False

    # Manual clear
    await rlm.set_cooldown("gemini", duration_seconds=10.0)
    assert await rlm.is_in_cooldown("gemini") is True
    await rlm.clear_cooldown("gemini")
    assert await rlm.is_in_cooldown("gemini") is False

