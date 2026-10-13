"""Crossref HTTP Client."""
import logging
from typing import Any

import httpx
import tenacity

from backend.core.config import get_settings
from backend.integrations.research.exceptions import (
    ResearchMalformedResponseError,
    ResearchProviderError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
)

logger = logging.getLogger(__name__)


def should_retry_crossref_error(exc: Exception) -> bool:
    """Determine if we should retry based on the exception."""
    if isinstance(exc, (ResearchUnavailableError, ResearchTimeoutError, ResearchRateLimitError)):
        return True
    return False


class CrossrefClient:
    """
    HTTP client for Crossref API.
    Handles polite pool identification, timeouts, rate limits, and retries.
    """

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self.settings = get_settings()
        self.base_url = self.settings.crossref_base_url.rstrip("/")
        
        # Polite pool header
        self.mailto = self.settings.crossref_mailto
        
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.settings.crossref_timeout_seconds,
        )
        self.max_retries = self.settings.crossref_max_retries

    async def __aenter__(self) -> "CrossrefClient":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def _execute_get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Execute GET request with error mapping."""
        # Include mailto in params for polite pool if configured
        if params is None:
            params = {}
        if self.mailto and "mailto" not in params:
            params["mailto"] = self.mailto

        try:
            response = await self._client.get(endpoint, params=params)
            
            if response.status_code == 429:
                raise ResearchRateLimitError("crossref", "Rate limit exceeded (429)")
            if response.status_code >= 500:
                raise ResearchUnavailableError("crossref", f"Service unavailable: {response.status_code}")
            
            response.raise_for_status()
            
            try:
                return response.json()
            except ValueError as e:
                raise ResearchMalformedResponseError("crossref", f"Invalid JSON response: {e}")
                
        except httpx.TimeoutException as e:
            raise ResearchTimeoutError("crossref", f"Request timed out: {e}")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {"message": "Resource not found."}
            raise ResearchProviderError("crossref", f"HTTP Error {e.response.status_code}: {e}")
        except httpx.RequestError as e:
            raise ResearchProviderError("crossref", f"Request failed: {e}")

    async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Execute GET request with Tenacity retries.
        """
        retryer = tenacity.AsyncRetrying(
            stop=tenacity.stop_after_attempt(self.max_retries),
            wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
            retry=tenacity.retry_if_exception(should_retry_crossref_error),
            reraise=True,
        )
        return await retryer(self._execute_get, endpoint, params)

    async def search_works(self, query: str, limit: int | None = None) -> list[dict[str, Any]]:
        """
        Search for bibliographic records.
        """
        limit = limit or self.settings.crossref_max_results
        
        params = {
            "query": query,
            "rows": limit,
            "select": "DOI,title,abstract,author,published-print,published-online,container-title,publisher,URL,type,subject"
        }
        
        result = await self.get("/works", params=params)
        message = result.get("message", {})
        if isinstance(message, dict):
            return message.get("items", [])
        return []

    async def get_work_by_doi(self, doi: str) -> dict[str, Any] | None:
        """
        Look up a specific work by DOI.
        """
        result = await self.get(f"/works/{doi}")
        message = result.get("message", {})
        
        if isinstance(message, str) and message == "Resource not found.":
            return None
            
        if isinstance(message, dict) and "DOI" in message:
            return message
        return None
