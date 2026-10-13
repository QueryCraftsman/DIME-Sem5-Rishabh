"""Semantic Scholar HTTP Client."""
import logging
from typing import Any

import httpx
import tenacity

from backend.core.config import get_settings
from backend.integrations.research.exceptions import (
    ResearchAuthenticationError,
    ResearchMalformedResponseError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
    ResearchProviderError,
)

logger = logging.getLogger(__name__)


def should_retry_semantic_scholar_error(exc: Exception) -> bool:
    """Determine if we should retry based on the exception."""
    if isinstance(exc, (ResearchUnavailableError, ResearchTimeoutError)):
        return True
    if isinstance(exc, ResearchRateLimitError):
        return True
    return False


class SemanticScholarClient:
    """
    HTTP client for Semantic Scholar API.
    Handles auth, timeouts, rate limits, and retries.
    """

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.semantic_scholar_base_url.rstrip("/")
        
        headers = {}
        if self.settings.semantic_scholar_api_key:
            headers["x-api-key"] = self.settings.semantic_scholar_api_key
        else:
            logger.warning("No SEMANTIC_SCHOLAR_API_KEY provided; API limits will be severely restricted.")

        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=self.settings.semantic_scholar_timeout_seconds,
        )
        self.max_retries = self.settings.semantic_scholar_max_retries

    async def __aenter__(self) -> "SemanticScholarClient":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def _execute_get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Execute GET request with error mapping."""
        try:
            response = await self._client.get(endpoint, params=params)
            
            if response.status_code == 403 or response.status_code == 401:
                raise ResearchAuthenticationError("semantic_scholar", f"Auth failed: {response.status_code}")
            if response.status_code == 429:
                raise ResearchRateLimitError("semantic_scholar", "Rate limit exceeded (429)")
            if response.status_code >= 500:
                raise ResearchUnavailableError("semantic_scholar", f"Service unavailable: {response.status_code}")
            
            response.raise_for_status()
            
            try:
                return response.json()
            except ValueError as e:
                raise ResearchMalformedResponseError("semantic_scholar", f"Invalid JSON response: {e}")
                
        except httpx.TimeoutException as e:
            raise ResearchTimeoutError("semantic_scholar", f"Request timed out: {e}")
        except httpx.HTTPStatusError as e:
            raise ResearchProviderError("semantic_scholar", f"HTTP Error {e.response.status_code}: {e}")
        except httpx.RequestError as e:
            raise ResearchProviderError("semantic_scholar", f"Request failed: {e}")

    async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Execute GET request with Tenacity retries.
        """
        retryer = tenacity.AsyncRetrying(
            stop=tenacity.stop_after_attempt(self.max_retries),
            wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
            retry=tenacity.retry_if_exception(should_retry_semantic_scholar_error),
            reraise=True,
        )
        return await retryer(self._execute_get, endpoint, params)

    async def search_papers(self, query: str, limit: int | None = None) -> list[dict[str, Any]]:
        """
        Search for papers matching a query string.
        """
        limit = limit or self.settings.semantic_scholar_max_results
        
        # We specify exactly which fields we want to reduce bandwidth
        fields = "paperId,title,abstract,authors,year,venue,url,externalIds,citationCount"
        
        params = {
            "query": query,
            "limit": limit,
            "fields": fields
        }
        
        result = await self.get("/paper/search", params=params)
        
        return result.get("data", [])
