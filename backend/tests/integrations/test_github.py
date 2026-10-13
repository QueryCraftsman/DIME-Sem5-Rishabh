from typing import Any, Generator
import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock

from backend.integrations.github.client import GitHubClient
from backend.integrations.github.service import GitHubService
from backend.integrations.github.adapter import GitHubAdapter
from backend.integrations.github.exceptions import (
    GitHubAuthenticationError,
    GitHubRateLimitExceeded,
    GitHubSecondaryRateLimitError,
    GitHubResourceNotFoundError,
    GitHubTimeoutError,
    GitHubUnavailableError,
)


@pytest.fixture(autouse=True)
def mock_cache_manager() -> Generator[AsyncMock, None, None]:
    with patch("backend.integrations.github.client.cache_manager", new_callable=AsyncMock) as mock_cache:
        mock_cache.get.return_value = None
        yield mock_cache


@pytest.mark.asyncio
async def test_client_success() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"key": "value"}
        mock_response.headers = httpx.Headers({"etag": "test-etag", "x-ratelimit-remaining": "4999"})
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            result = await client.get("/test")
            assert result == {"key": "value"}
            assert client.latest_rate_limit is not None
            assert client.latest_rate_limit.remaining == 4999


@pytest.mark.asyncio
async def test_client_etag_caching(mock_cache_manager: AsyncMock) -> None:
    # Set cache to have a hit
    mock_cache_manager.get.return_value = {"etag": "cached-etag", "json": {"cached": True}}
    
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 304
        mock_response.headers = httpx.Headers({"x-ratelimit-remaining": "5000"})
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            result = await client.get("/test")
            # Should return the cached json
            assert result == {"cached": True}
            
            # Verify If-None-Match was passed
            call_kwargs = mock_get.call_args.kwargs
            assert "If-None-Match" in call_kwargs["headers"]
            assert call_kwargs["headers"]["If-None-Match"] == "cached-etag"


@pytest.mark.asyncio
async def test_client_auth_error() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Bad credentials"
        mock_response.headers = httpx.Headers({})
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            with pytest.raises(GitHubAuthenticationError):
                await client.get("/test")


@pytest.mark.asyncio
async def test_client_not_found() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.headers = httpx.Headers({})
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            with pytest.raises(GitHubResourceNotFoundError):
                await client.get("/test")


@pytest.mark.asyncio
async def test_client_primary_rate_limit() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.headers = httpx.Headers({
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": "123456789"
        })
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            with pytest.raises(GitHubRateLimitExceeded) as exc:
                await client.get("/test")
            assert exc.value.reset_epoch == 123456789


@pytest.mark.asyncio
async def test_client_secondary_rate_limit_retry() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # Simulate secondary rate limit (403, but remaining > 0)
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.headers = httpx.Headers({"x-ratelimit-remaining": "100"})
        mock_response.text = "secondary limit"
        mock_get.return_value = mock_response

        async with GitHubClient() as client:
            # Should exhaust max retries (3) and raise
            with pytest.raises(GitHubSecondaryRateLimitError):
                await client.get("/test")
                
            assert mock_get.call_count == 3


@pytest.mark.asyncio
async def test_client_timeout_retry() -> None:
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("timeout")

        async with GitHubClient() as client:
            with pytest.raises(GitHubTimeoutError):
                await client.get("/test")
                
            assert mock_get.call_count == 3


@pytest.mark.asyncio
async def test_service_search_deduplication() -> None:
    mock_client = AsyncMock()
    mock_client.latest_rate_limit = None
    # Return page 1 for query 1, then empty for page 2.
    # We will pretend the service issues 2 queries. Both return repo ID 1, one returns repo ID 2.
    
    def side_effect(
        endpoint: str,
        params: dict[str, Any] | None = None,
        use_cache: bool = True,
    ) -> dict[str, Any]:
        if params and "q" in params:
            if params["q"] == "test query in:readme,description":
                if params["page"] == 1:
                    return {"items": [{"id": 1, "name": "repo1"}, {"id": 2, "name": "repo2"}], "total_count": 2}
            elif params["q"] == "test query system in:readme":
                if params["page"] == 1:
                    return {"items": [{"id": 1, "name": "repo1"}, {"id": 3, "name": "repo3"}], "total_count": 2}
        empty_items: list[dict[str, Any]] = []
        return {"items": empty_items}

    mock_client.get.side_effect = side_effect
    
    service = GitHubService(client=mock_client)
    # mock _generate_queries to force 2 deterministic queries
    service._generate_queries = MagicMock(return_value=["test query in:readme,description", "test query system in:readme"])
    
    result, diag = await service.acquire_evidence("test query")
    
    # IDs 1, 2, 3 should be captured exactly once. Total 3.
    assert len(result.documents) == 3
    ids = {d.source_id for d in result.documents}
    assert ids == {"1", "2", "3"}


@pytest.mark.asyncio
async def test_service_partial_results_on_rate_limit() -> None:
    mock_client = AsyncMock()
    mock_client.latest_rate_limit = None
    # First query succeeds, second throws rate limit
    def side_effect(
        endpoint: str,
        params: dict[str, Any] | None = None,
        use_cache: bool = True,
    ) -> dict[str, Any]:
        if params and params.get("q") == "query1":
            return {"items": [{"id": 1, "name": "repo1"}], "total_count": 1}
        raise GitHubRateLimitExceeded(reset_epoch=123)

    mock_client.get.side_effect = side_effect
    
    service = GitHubService(client=mock_client)
    service._generate_queries = MagicMock(return_value=["query1", "query2"])
    
    result, diag = await service.acquire_evidence("idea")
    
    assert len(result.documents) == 1
    assert result.partial is True


def test_adapter_normalization() -> None:
    repo_data = {
        "id": 123,
        "owner": {"login": "testowner"},
        "name": "testrepo",
        "description": "A cool repo",
        "html_url": "https://github.com/test/test",
        "stargazers_count": 100,
        "language": "Python",
        "license": {"spdx_id": "MIT"},
        "created_at": "2023-01-01T10:00:00Z"
    }
    readme = "Hello world"
    
    doc = GitHubAdapter.normalize_repository(repo_data, readme)
    
    assert doc.source == "github"
    assert doc.source_id == "123"
    assert doc.title == "testowner/testrepo"
    assert doc.text is not None
    assert "Description: A cool repo" in doc.text
    assert "README:\nHello world" in doc.text
    assert doc.url == "https://github.com/test/test"
    assert doc.metadata["stars"] == 100
    assert doc.metadata["license"] == "MIT"
    assert doc.metadata["language"] == "Python"
