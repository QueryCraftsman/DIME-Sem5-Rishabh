"""Unit tests for IEEE Xplore Client and Adapter."""
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from backend.integrations.research.ieee_client import IEEEXploreClient
from backend.integrations.research.ieee_adapter import IEEEXploreAdapter
from backend.integrations.research.exceptions import (
    ResearchAuthenticationError,
    ResearchMalformedResponseError,
    ResearchProviderError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
)

@pytest.mark.asyncio
async def test_ieee_client_search_success():
    """Test successful article search."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = httpx.Response(
            status_code=200,
            json={"articles": [{"article_number": "12345", "title": "Test Paper"}]},
            request=httpx.Request("GET", "https://test")
        )
        mock_get.return_value = mock_response

        async with IEEEXploreClient() as client:
            client.api_key = "test_key"
            results = await client.search_articles("test query", limit=1)
            
            assert len(results) == 1
            assert results[0]["article_number"] == "12345"
            
            mock_get.assert_called_once()
            args, kwargs = mock_get.call_args
            assert kwargs["params"]["querytext"] == "test query"
            assert kwargs["params"]["max_records"] == 1
            assert kwargs["params"]["apikey"] == "test_key"


@pytest.mark.asyncio
async def test_ieee_client_auth_error():
    """Test 403 Authentication Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=403, text="Forbidden", request=httpx.Request("GET", "https://test")
        )

        async with IEEEXploreClient() as client:
            with pytest.raises(ResearchAuthenticationError):
                await client.search_articles("test")


@pytest.mark.asyncio
async def test_ieee_client_rate_limit():
    """Test 429 Rate Limit Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=429, text="Too Many Requests", request=httpx.Request("GET", "https://test")
        )

        async with IEEEXploreClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchRateLimitError):
                await client.search_articles("test")


@pytest.mark.asyncio
async def test_ieee_client_rate_limit_text_match():
    """Test 403 Rate Limit Text Match Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=403, text="Developer Inactive", request=httpx.Request("GET", "https://test")
        )

        async with IEEEXploreClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchRateLimitError):
                await client.search_articles("test")


@pytest.mark.asyncio
async def test_ieee_client_unavailable():
    """Test 500 Server Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=500, text="Internal Server Error", request=httpx.Request("GET", "https://test")
        )

        async with IEEEXploreClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchUnavailableError):
                await client.search_articles("test")


@pytest.mark.asyncio
async def test_ieee_client_timeout():
    """Test Timeout."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Timeout")

        async with IEEEXploreClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchTimeoutError):
                await client.search_articles("test")


@pytest.mark.asyncio
async def test_ieee_client_malformed_json():
    """Test JSON parsing error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=200, text="Not JSON", request=httpx.Request("GET", "https://test")
        )

        async with IEEEXploreClient() as client:
            with pytest.raises(ResearchMalformedResponseError):
                await client.search_articles("test")


def test_ieee_adapter_normalize_article():
    """Test mapping IEEE JSON to SourceDocument."""
    mock_api_response = {
        "article_number": "123456",
        "title": "An IEEE Paper",
        "abstract": "IEEE abstract here.",
        "publication_title": "IEEE Transactions on Something",
        "publication_year": "2023",
        "doi": "10.1109/TEST.2023.123456",
        "document_link": "https://ieeexplore.ieee.org/document/123456/",
        "authors": {
            "authors": [
                {"full_name": "Alice Smith"},
                {"full_name": "Bob Jones"}
            ]
        },
        "publisher": "IEEE"
    }
    
    doc = IEEEXploreAdapter.normalize_article(mock_api_response)
    
    assert doc.source == "ieee_xplore"
    assert doc.source_id == "123456"
    assert doc.entity_type == "paper"
    assert doc.title == "An IEEE Paper"
    assert doc.url == "https://ieeexplore.ieee.org/document/123456/"
    assert doc.published_at is not None
    assert doc.published_at.year == 2023
    assert doc.metadata["doi"] == "10.1109/TEST.2023.123456"
    assert doc.metadata["publisher"] == "IEEE"
    assert "Alice Smith" in doc.text
    assert "IEEE Transactions" in doc.text
    assert "IEEE abstract here." in doc.text
