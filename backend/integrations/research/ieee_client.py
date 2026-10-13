"""IEEE Xplore HTTP Client."""
import logging
from typing import Any

import httpx
import tenacity

from backend.core.config import get_settings
from backend.integrations.research.exceptions import (
    ResearchAuthenticationError,
    ResearchMalformedResponseError,
    ResearchProviderError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
)

logger = logging.getLogger(__name__)


def should_retry_ieee_error(exc: Exception) -> bool:
    """Determine if we should retry based on the exception."""
    if isinstance(exc, (ResearchUnavailableError, ResearchTimeoutError, ResearchRateLimitError)):
        return True
    return False


class IEEEXploreClient:
    """
    HTTP client for IEEE Xplore API.
    Handles auth, timeouts, rate limits, and retries.
    """

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.ieee_xplore_base_url.rstrip("/")
        
        self.api_key = self.settings.ieee_xplore_api_key
        if not self.api_key:
            logger.warning("No IEEE_XPLORE_API_KEY provided; requests will fail.")

        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.settings.ieee_xplore_timeout_seconds,
        )
        self.max_retries = self.settings.ieee_xplore_max_retries

    async def __aenter__(self) -> "IEEEXploreClient":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def _execute_get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Execute GET request with error mapping."""
        if params is None:
            params = {}
        
        # IEEE uses apikey as a query param
        if self.api_key and "apikey" not in params:
            params["apikey"] = self.api_key

        try:
            response = await self._client.get(endpoint, params=params)
            
            if response.status_code == 403 or response.status_code == 401:
                if "Rate Limit" in response.text or "Developer Inactive" in response.text or "Quota" in response.text:
                    raise ResearchRateLimitError("ieee", "Rate limit exceeded")
                raise ResearchAuthenticationError("ieee", f"Auth failed: {response.status_code}")
            if response.status_code == 429:
                raise ResearchRateLimitError("ieee", "Rate limit exceeded (429)")
            if response.status_code >= 500:
                raise ResearchUnavailableError("ieee", f"Service unavailable: {response.status_code}")
            
            response.raise_for_status()
            
            try:
                return response.json()
            except ValueError as e:
                raise ResearchMalformedResponseError("ieee", f"Invalid JSON response: {e}")
                
        except httpx.TimeoutException as e:
            raise ResearchTimeoutError("ieee", f"Request timed out: {e}")
        except httpx.HTTPStatusError as e:
            raise ResearchProviderError("ieee", f"HTTP Error {e.response.status_code}: {e}")
        except httpx.RequestError as e:
            raise ResearchProviderError("ieee", f"Request failed: {e}")

    async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Execute GET request with Tenacity retries.
        """
        retryer = tenacity.AsyncRetrying(
            stop=tenacity.stop_after_attempt(self.max_retries),
            wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
            retry=tenacity.retry_if_exception(should_retry_ieee_error),
            reraise=True,
        )
        return await retryer(self._execute_get, endpoint, params)

    async def search_articles(self, query: str, limit: int | None = None) -> list[dict[str, Any]]:
        """
        Search for articles in IEEE Xplore.
        """
        limit = limit or self.settings.ieee_xplore_max_results
        
        params = {
            "querytext": query,
            "max_records": limit
        }
        
        result = await self.get("", params=params)  # Base URL contains /search/articles already in .env
        return result.get("articles", [])
