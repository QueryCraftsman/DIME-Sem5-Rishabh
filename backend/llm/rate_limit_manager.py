"""
DIME Centralized LLM Architecture — Rate-Limit & Shared Cooldown Manager (Phase 4).
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from backend.core.cache import cache_manager

logger = logging.getLogger("dime.llm.rate_limit")


class RateLimitManager:
    """
    Manages rate limits and provider cooldown periods.
    Uses Redis for distributed state across Celery workers, with seamless
    in-memory fallback if Redis is unreachable or offline.
    """

    def __init__(self, default_cooldown_seconds: float = 60.0) -> None:
        self.default_cooldown_seconds = default_cooldown_seconds
        self._local_cooldowns: dict[str, dict[str, Any]] = {}

    def _redis_key(self, provider: str) -> str:
        return f"llm:provider:{provider.lower()}:cooldown"

    async def set_cooldown(
        self,
        provider: str,
        duration_seconds: float | None = None,
        reason: str = "rate_limit",
    ) -> None:
        """
        Activates a cooldown window for a provider across all backend workers.
        """
        cooldown_duration = duration_seconds if duration_seconds is not None else self.default_cooldown_seconds
        now = time.time()
        expires_at = now + cooldown_duration

        data = {
            "provider": provider.lower(),
            "start": now,
            "expires_at": expires_at,
            "duration": cooldown_duration,
            "reason": reason,
        }

        # 1. Update local in-memory fallback
        self._local_cooldowns[provider.lower()] = data
        logger.warning(
            f"[LLM Cooldown] Provider '{provider}' entered cooldown for {round(cooldown_duration, 1)}s. Reason: {reason}"
        )

        # 2. Update Redis for distributed workers with fast 0.5s timeout
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                key = self._redis_key(provider)
                await asyncio.wait_for(
                    cache_manager.redis.set(
                        key,
                        json.dumps(data),
                        ex=int(cooldown_duration) + 1,
                    ),
                    timeout=0.5,
                )
        except Exception as redis_err:
            logger.debug(f"Redis unavailable for setting LLM cooldown (using local memory): {redis_err}")

    async def is_in_cooldown(self, provider: str) -> bool:
        """
        Checks whether a provider is currently under an active cooldown window.
        """
        now = time.time()
        prov_key = provider.lower()

        # 1. Check Redis first with fast 0.5s timeout
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                val = await asyncio.wait_for(
                    cache_manager.redis.get(self._redis_key(prov_key)),
                    timeout=0.5,
                )
                if val:
                    record = json.loads(val)
                    if record.get("expires_at", 0) > now:
                        return True
                    return False
        except Exception as redis_err:
            logger.debug(f"Redis unavailable for checking LLM cooldown: {redis_err}")

        # 2. Check local fallback
        if prov_key in self._local_cooldowns:
            record = self._local_cooldowns[prov_key]
            if record.get("expires_at", 0) > now:
                return True
            else:
                self._local_cooldowns.pop(prov_key, None)

        return False

    async def get_remaining_cooldown(self, provider: str) -> float:
        """Returns remaining cooldown seconds (0.0 if not in cooldown)."""
        now = time.time()
        prov_key = provider.lower()

        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                val = await asyncio.wait_for(
                    cache_manager.redis.get(self._redis_key(prov_key)),
                    timeout=0.5,
                )
                if val:
                    record = json.loads(val)
                    return max(0.0, record.get("expires_at", 0) - now)
        except Exception:
            pass

        if prov_key in self._local_cooldowns:
            record = self._local_cooldowns[prov_key]
            return max(0.0, record.get("expires_at", 0) - now)

        return 0.0

    async def clear_cooldown(self, provider: str) -> None:
        """Manually clears cooldown for a recovered provider."""
        prov_key = provider.lower()
        self._local_cooldowns.pop(prov_key, None)
        try:
            await cache_manager.connect()
            if cache_manager.redis is not None:
                await asyncio.wait_for(
                    cache_manager.redis.delete(self._redis_key(prov_key)),
                    timeout=0.5,
                )
        except Exception:
            pass


# Global singleton rate-limit manager
rate_limit_manager = RateLimitManager()
