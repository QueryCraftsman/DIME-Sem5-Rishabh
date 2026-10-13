"""
Robots.txt compliance and caching.
"""

import logging
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx

from backend.core.cache import cache_manager
from backend.core.config import get_settings

logger = logging.getLogger(__name__)


class RobotsChecker:
    """Fetches, caches, and enforces robots.txt rules for web domains."""
    
    USER_AGENT = "dime-research-bot"

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self.settings = get_settings()
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(timeout=10.0)

    async def __aenter__(self) -> "RobotsChecker":
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def is_allowed(self, url: str) -> bool:
        """
        Check if the configured USER_AGENT is allowed to crawl the given URL.
        Utilizes Redis to cache the robots.txt content per domain.
        """
        parsed = urlparse(url)
        if not parsed.hostname:
            return False

        domain = parsed.hostname
        port = f":{parsed.port}" if parsed.port else ""
        scheme = parsed.scheme
        base_url = f"{scheme}://{domain}{port}"
        robots_url = f"{base_url}/robots.txt"

        cache_key = f"robots_{domain}"

        # 1. Check Cache
        cached_robots_content = await cache_manager.get(cache_key)
        
        robots_text = ""
        if cached_robots_content and "content" in cached_robots_content:
            robots_text = cached_robots_content["content"]
        else:
            # 2. Fetch Live
            try:
                response = await self._client.get(robots_url, follow_redirects=True)
                if response.status_code == 200:
                    robots_text = response.text
                elif response.status_code in (401, 403):
                    # If robots.txt is strictly forbidden, assume all is forbidden as a conservative measure,
                    # or standard allows it if 403 means "everything allowed"?
                    # RFC 9309 says if 401/403, it means full disallow.
                    robots_text = "User-agent: *\nDisallow: /"
                elif response.status_code >= 400 and response.status_code < 500:
                    # 404 means no rules, full allow.
                    robots_text = ""
                elif response.status_code >= 500:
                    # 5xx means full disallow temporarily
                    robots_text = "User-agent: *\nDisallow: /"
            except Exception as e:
                logger.warning(f"Failed to fetch robots.txt for {domain}: {e}")
                # Fail open or closed? Typically fail closed (disallow) or treat as empty.
                # Since this is a controlled crawler, we will fail closed if we can't determine safety.
                robots_text = "User-agent: *\nDisallow: /"

            # Cache the result
            await cache_manager.set(
                cache_key,
                {"content": robots_text},
                ttl_seconds=self.settings.crawl_robots_cache_ttl_seconds
            )

        # 3. Parse and Enforce
        parser = RobotFileParser(url=robots_url)
        # Parse requires a list of lines
        lines = robots_text.splitlines()
        parser.parse(lines)

        return parser.can_fetch(self.USER_AGENT, url)
