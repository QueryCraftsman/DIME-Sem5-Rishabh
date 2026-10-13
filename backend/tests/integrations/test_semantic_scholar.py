"""Unit tests for Semantic Scholar Client."""
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from backend.integrations.research.exceptions import (
    ResearchAuthenticationError,
    ResearchMalformedResponseError,
    ResearchProviderError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
)
from backend.integrations.research.semantic_scholar_client import SemanticScholarClient


@pytest.mark.asyncio
async def test_semantic_scholar_client_success():
    """Test successful paper search."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = httpx.Response(
            status_code=200,
            json={"data": [{"paperId": "123", "title": "Test Paper"}]},
            request=httpx.Request("GET", "https://test")
        )
        # MagicMock property text doesn't work well with json() sometimes, but httpx.Response works.
        mock_get.return_value = mock_response

        async with SemanticScholarClient() as client:
            results = await client.search_papers("test query", limit=1)
            
            assert len(results) == 1
            assert results[0]["paperId"] == "123"
            
            mock_get.assert_called_once()
            args, kwargs = mock_get.call_args
            assert args[0] == "/paper/search"
            assert kwargs["params"]["query"] == "test query"
            assert kwargs["params"]["limit"] == 1
            assert "fields" in kwargs["params"]


@pytest.mark.asyncio
async def test_semantic_scholar_client_auth_error():
    """Test 403 Authentication Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=403, text="Forbidden", request=httpx.Request("GET", "https://test")
        )

        async with SemanticScholarClient() as client:
            with pytest.raises(ResearchAuthenticationError) as exc_info:
                await client.search_papers("test")
            
            assert "Auth failed: 403" in str(exc_info.value)


@pytest.mark.asyncio
async def test_semantic_scholar_client_rate_limit():
    """Test 429 Rate Limit Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=429, text="Too Many Requests", request=httpx.Request("GET", "https://test")
        )

        async with SemanticScholarClient() as client:
            # Override max_retries to make test faster
            client.max_retries = 1
            with pytest.raises(ResearchRateLimitError):
                await client.search_papers("test")


@pytest.mark.asyncio
async def test_semantic_scholar_client_unavailable():
    """Test 500 Server Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=500, text="Internal Server Error", request=httpx.Request("GET", "https://test")
        )

        async with SemanticScholarClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchUnavailableError):
                await client.search_papers("test")


@pytest.mark.asyncio
async def test_semantic_scholar_client_timeout():
    """Test Timeout."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Timeout")

        async with SemanticScholarClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchTimeoutError):
                await client.search_papers("test")


@pytest.mark.asyncio
async def test_semantic_scholar_client_malformed_json():
    """Test JSON parsing error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # Invalid JSON
        mock_get.return_value = httpx.Response(
            status_code=200, text="Not JSON", request=httpx.Request("GET", "https://test")
        )

        async with SemanticScholarClient() as client:
            with pytest.raises(ResearchMalformedResponseError):
                await client.search_papers("test")


@pytest.mark.asyncio
async def test_semantic_scholar_client_retry_success():
    """Test success after one retry."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # First call: 429, Second call: 200
        mock_get.side_effect = [
            httpx.Response(
                status_code=429, text="Too Many Requests", request=httpx.Request("GET", "https://test")
            ),
            httpx.Response(
                status_code=200, json={"data": [{"paperId": "abc"}]}, request=httpx.Request("GET", "https://test")
            ),
        ]

        async with SemanticScholarClient() as client:
            # Use small retry logic
            client.max_retries = 2
            results = await client.search_papers("retry test")
            
            assert len(results) == 1
            assert results[0]["paperId"] == "abc"
            assert mock_get.call_count == 2


def test_semantic_scholar_adapter_normalize_paper():
    """Test mapping Semantic Scholar JSON to SourceDocument."""
    from backend.integrations.research.semantic_scholar_adapter import SemanticScholarAdapter
    
    mock_api_response = {
        "paperId": "abc123def",
        "title": "A Great AI Paper",
        "abstract": "This is the abstract.",
        "year": 2023,
        "venue": "NeurIPS",
        "url": "https://semanticscholar.org/paper/abc123def",
        "citationCount": 42,
        "authors": [
            {"name": "Alice Smith", "authorId": "1"},
            {"name": "Bob Jones"}
        ],
        "externalIds": {
            "DOI": "10.1234/5678"
        }
    }
    
    doc = SemanticScholarAdapter.normalize_paper(mock_api_response)
    
    assert doc.source == "semantic_scholar"
    assert doc.source_id == "abc123def"
    assert doc.entity_type == "paper"
    assert doc.title == "A Great AI Paper"
    assert doc.url == "https://semanticscholar.org/paper/abc123def"
    assert doc.published_at is not None
    assert doc.published_at.year == 2023
    assert doc.metadata["citation_count"] == 42
    assert doc.metadata["externalIds"]["DOI"] == "10.1234/5678"
    assert "Alice Smith" in doc.text
    assert "NeurIPS" in doc.text
    assert "This is the abstract." in doc.text
