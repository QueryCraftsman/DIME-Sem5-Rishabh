"""
Redis caching utility.
Provides defensive connection management, instantaneous socket probing, and in-memory fallback.
"""

from __future__ import annotations

import json
import logging
import socket
from typing import Any

try:
    import redis.asyncio as redis
except ImportError:
    redis = None  # type: ignore

from backend.core.config import get_settings

logger = logging.getLogger("dime.core.cache")


class CacheManager:
    """Wrapper for Redis cache with instantaneous socket probing and local memory fallback."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.redis: Any = None
        self._memory_cache: dict[str, str] = {}
        self._connection_failed: bool = False

    def _can_connect_socket(self) -> bool:
        """Instantaneous probe (0.05s) to check if Redis port is reachable without DNS hanging."""
        try:
            url = self.settings.redis_url.replace("localhost", "127.0.0.1")
            # Parse host & port
            host = "127.0.0.1"
            port = 6381
            if "://" in url:
                part = url.split("://", 1)[1].split("/", 1)[0]
                if ":" in part:
                    h, p = part.split(":")
                    host = h or "127.0.0.1"
                    port = int(p)
            sock = socket.create_connection((host, port), timeout=0.05)
            sock.close()
            return True
        except Exception:
            return False

    async def connect(self) -> None:
        if self._connection_failed:
            return

        if self.redis is None and redis is not None:
            if not self._can_connect_socket():
                self._connection_failed = True
                self.redis = None
                return

            try:
                url = self.settings.redis_url.replace("localhost", "127.0.0.1")
                self.redis = redis.from_url(
                    url,
                    decode_responses=True,
                    socket_connect_timeout=0.2,
                    socket_timeout=0.2,
                )
            except Exception as e:
                logger.debug(f"Redis unavailable ({e}); using local memory cache.")
                self.redis = None
                self._connection_failed = True

    async def close(self) -> None:
        if self.redis is not None:
            try:
                await self.redis.aclose()
            except Exception:
                pass
            self.redis = None

    async def get(self, key: str) -> dict[str, Any] | None:
        await self.connect()
        if self.redis is not None:
            try:
                val = await self.redis.get(key)
                if val:
                    return json.loads(val)
                return None
            except Exception as e:
                logger.debug(f"Redis get failed for {key}: {e}")
                self._connection_failed = True
        
        # Local memory fallback
        val = self._memory_cache.get(key)
        if val:
            try:
                return json.loads(val)
            except Exception:
                pass
        return None

    async def set(self, key: str, value: dict[str, Any], ttl_seconds: int = 300) -> None:
        await self.connect()
        serialized = json.dumps(value)
        if self.redis is not None:
            try:
                await self.redis.set(key, serialized, ex=ttl_seconds)
                return
            except Exception as e:
                logger.debug(f"Redis set failed for {key}: {e}")
                self._connection_failed = True
        
        # Local memory fallback
        self._memory_cache[key] = serialized


# Global instance
cache_manager = CacheManager()


async def get_redis_client() -> Any:
    await cache_manager.connect()
    return cache_manager.redis
