"""
GitHub REST API HTTP Client.
Handles raw HTTP communication, rate limits, caching (ETag), and exceptions.
"""

import logging
from typing import Any, cast

import httpx
import tenacity
from backend.core.cache import cache_manager
from backend.core.config import get_settings
from backend.integrations.github.exceptions import (
    GitHubAuthenticationError,
    GitHubIntegrationError,
    GitHubMalformedResponseError,
    GitHubRateLimitExceeded,
    GitHubResourceNotFoundError,
    GitHubSecondaryRateLimitError,
    GitHubTimeoutError,
    GitHubUnavailableError,
)
from backend.schemas.github import GitHubRateLimit

logger = logging.getLogger(__name__)


def should_retry_github_error(exc: BaseException) -> bool:
    """Determine if we should retry based on the exception."""
    # Retry on 5xx or specific timeout/secondary rate limits
    if isinstance(exc, (GitHubUnavailableError, GitHubTimeoutError)):
        return True
    if isinstance(exc, GitHubSecondaryRateLimitError):
        return True
    return False


class GitHubClient:
    """Async HTTP client for GitHub REST API."""

    def __init__(self) -> None:
        self.settings = get_settings()

        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": self.settings.github_api_version,
            "User-Agent": "DIME-Backend/0.1",
        }

        if self.settings.github_token:
            headers["Authorization"] = f"Bearer {self.settings.github_token}"
        else:
            logger.warning("No GITHUB_TOKEN provided; API limits will be restricted.")

        self.client = httpx.AsyncClient(
            base_url=self.settings.github_api_url,
            headers=headers,
            timeout=self.settings.github_request_timeout_seconds,
        )
        self.latest_rate_limit: GitHubRateLimit | None = None

    async def __aenter__(self) -> "GitHubClient":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.client.aclose()

    def _parse_rate_limit(self, headers: httpx.Headers) -> None:
        """Extract and store rate limit info."""
        try:
            self.latest_rate_limit = GitHubRateLimit(
                limit=int(headers.get("x-ratelimit-limit", 0)),
                remaining=int(headers.get("x-ratelimit-remaining", 0)),
                reset_epoch=int(headers.get("x-ratelimit-reset", 0)),
                used=int(headers.get("x-ratelimit-used", 0)),
            )
        except ValueError:
            pass

    async def get(
        self, endpoint: str, params: dict[str, Any] | None = None, use_cache: bool = True
    ) -> dict[str, Any]:
        """
        Perform a GET request with ETag caching and retries.
        Returns the parsed JSON dictionary.
        """
        # We will wrap the inner call with tenacity
        retryer = tenacity.AsyncRetrying(
            stop=tenacity.stop_after_attempt(self.settings.github_max_retries),
            wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
            retry=tenacity.retry_if_exception(should_retry_github_error),
            reraise=True,
        )

        return await retryer(self._execute_get, endpoint, params, use_cache)

    async def _execute_get(
        self, endpoint: str, params: dict[str, Any] | None, use_cache: bool
    ) -> dict[str, Any]:

        cache_key = (
            f"github_cache:{endpoint}:{hash(frozenset(params.items())) if params else 'none'}"
        )
        request_headers = {}

        cached_data = None
        if use_cache:
            cached_data = await cache_manager.get(cache_key)
            if cached_data and "etag" in cached_data:
                request_headers["If-None-Match"] = cached_data["etag"]

        try:
            logger.debug(f"GitHub GET {endpoint}")
            response = await self.client.get(endpoint, params=params, headers=request_headers)
            self._parse_rate_limit(response.headers)

            # Handle 304 Not Modified
            if response.status_code == 304 and cached_data:
                return cast(dict[str, Any], cached_data["json"])

            # Handle Rate Limits
            if response.status_code in (403, 429):
                remaining = int(response.headers.get("x-ratelimit-remaining", 1))
                if remaining == 0:
                    reset_epoch = int(response.headers.get("x-ratelimit-reset", 0))
                    raise GitHubRateLimitExceeded(reset_epoch=reset_epoch)

                # If remaining > 0 but we got 403/429, it's a secondary rate limit
                raise GitHubSecondaryRateLimitError(
                    f"Secondary rate limit. Message: {response.text}"
                )

            # Handle standard errors
            if response.status_code == 401 or response.status_code == 403:
                raise GitHubAuthenticationError(
                    f"Auth failed: {response.status_code} - {response.text}"
                )
            if response.status_code == 404:
                raise GitHubResourceNotFoundError(f"Not found: {endpoint}")
            if response.status_code >= 500:
                raise GitHubUnavailableError(f"GitHub API unavailable: {response.status_code}")

            response.raise_for_status()

            # Parse JSON
            try:
                result_json = response.json()
            except Exception as e:
                raise GitHubMalformedResponseError("Failed to parse JSON") from e

            # Save to cache if ETag is present
            if use_cache and "etag" in response.headers:
                await cache_manager.set(
                    cache_key,
                    {"etag": response.headers["etag"], "json": result_json},
                    ttl_seconds=self.settings.github_cache_ttl_seconds,
                )

            return cast(dict[str, Any], result_json)

        except httpx.TimeoutException as e:
            raise GitHubTimeoutError("Request timed out") from e
        except httpx.RequestError as e:
            raise GitHubIntegrationError(f"Request failed: {e}") from e
