"""
Redis caching utility.
"""

import json
from typing import Any

import redis.asyncio as redis

from backend.core.config import get_settings


class CacheManager:
    """Simple wrapper for Redis cache."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.redis: redis.Redis | None = None

    async def connect(self) -> None:
        if self.redis is None:
            self.redis = redis.from_url(self.settings.redis_url, decode_responses=True)

    async def close(self) -> None:
        if self.redis is not None:
            await self.redis.aclose()

    async def get(self, key: str) -> dict[str, Any] | None:
        await self.connect()
        assert self.redis is not None
        val = await self.redis.get(key)
        if val:
            from typing import cast
            return cast(dict[str, Any], json.loads(val))
        return None

    async def set(self, key: str, value: dict[str, Any], ttl_seconds: int) -> None:
        await self.connect()
        assert self.redis is not None
        await self.redis.set(key, json.dumps(value), ex=ttl_seconds)


# Global instance
cache_manager = CacheManager()

async def get_redis_client() -> redis.Redis:
    await cache_manager.connect()
    assert cache_manager.redis is not None
    return cache_manager.redis
