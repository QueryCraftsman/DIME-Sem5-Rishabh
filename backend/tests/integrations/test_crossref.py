"""Unit tests for Crossref Client and Adapter."""
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from backend.integrations.research.crossref_client import CrossrefClient
from backend.integrations.research.crossref_adapter import CrossrefAdapter
from backend.integrations.research.exceptions import (
    ResearchMalformedResponseError,
    ResearchProviderError,
    ResearchRateLimitError,
    ResearchTimeoutError,
    ResearchUnavailableError,
)

@pytest.mark.asyncio
async def test_crossref_client_search_success():
    """Test successful bibliographic search."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = httpx.Response(
            status_code=200,
            json={"message": {"items": [{"DOI": "10.1234/5678", "title": ["Test Paper"]}]}},
            request=httpx.Request("GET", "https://test")
        )
        mock_get.return_value = mock_response

        async with CrossrefClient() as client:
            client.mailto = "test@example.com"
            results = await client.search_works("test query", limit=1)
            
            assert len(results) == 1
            assert results[0]["DOI"] == "10.1234/5678"
            
            mock_get.assert_called_once()
            args, kwargs = mock_get.call_args
            assert args[0] == "/works"
            assert kwargs["params"]["query"] == "test query"
            assert kwargs["params"]["rows"] == 1
            assert "select" in kwargs["params"]
            assert kwargs["params"]["mailto"] == "test@example.com"


@pytest.mark.asyncio
async def test_crossref_client_doi_lookup_success():
    """Test successful DOI lookup."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = httpx.Response(
            status_code=200,
            json={"message": {"DOI": "10.1234/5678", "title": ["Test Paper"]}},
            request=httpx.Request("GET", "https://test")
        )
        mock_get.return_value = mock_response

        async with CrossrefClient() as client:
            result = await client.get_work_by_doi("10.1234/5678")
            
            assert result is not None
            assert result["DOI"] == "10.1234/5678"


@pytest.mark.asyncio
async def test_crossref_client_doi_lookup_not_found():
    """Test DOI lookup returning 404."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_response = httpx.Response(
            status_code=404, text="Resource not found.",
            request=httpx.Request("GET", "https://test")
        )
        mock_get.return_value = mock_response

        async with CrossrefClient() as client:
            result = await client.get_work_by_doi("invalid_doi")
            assert result is None


@pytest.mark.asyncio
async def test_crossref_client_rate_limit():
    """Test 429 Rate Limit Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=429, text="Too Many Requests", request=httpx.Request("GET", "https://test")
        )

        async with CrossrefClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchRateLimitError):
                await client.search_works("test")


@pytest.mark.asyncio
async def test_crossref_client_unavailable():
    """Test 500 Server Error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=500, text="Internal Server Error", request=httpx.Request("GET", "https://test")
        )

        async with CrossrefClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchUnavailableError):
                await client.search_works("test")


@pytest.mark.asyncio
async def test_crossref_client_timeout():
    """Test Timeout."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.TimeoutException("Timeout")

        async with CrossrefClient() as client:
            client.max_retries = 1
            with pytest.raises(ResearchTimeoutError):
                await client.search_works("test")


@pytest.mark.asyncio
async def test_crossref_client_malformed_json():
    """Test JSON parsing error."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=200, text="Not JSON", request=httpx.Request("GET", "https://test")
        )

        async with CrossrefClient() as client:
            with pytest.raises(ResearchMalformedResponseError):
                await client.search_works("test")


def test_crossref_adapter_normalize_work():
    """Test mapping Crossref JSON to SourceDocument."""
    mock_api_response = {
        "DOI": "10.1234/crossref.test",
        "title": ["A Crossref Paper"],
        "abstract": "<jats:p>Abstract here.</jats:p>",
        "author": [
            {"given": "Alice", "family": "Smith"},
            {"given": "Bob", "family": "Jones"}
        ],
        "published-print": {
            "date-parts": [[2023, 10, 15]]
        },
        "container-title": ["Journal of Testing"],
        "publisher": "Test Publisher",
        "URL": "http://dx.doi.org/10.1234/crossref.test",
        "type": "journal-article",
        "subject": ["Computer Science"]
    }
    
    doc = CrossrefAdapter.normalize_work(mock_api_response)
    
    assert doc.source == "crossref"
    assert doc.source_id == "10.1234/crossref.test"
    assert doc.entity_type == "paper"
    assert doc.title == "A Crossref Paper"
    assert doc.url == "http://dx.doi.org/10.1234/crossref.test"
    assert doc.published_at is not None
    assert doc.published_at.year == 2023
    assert doc.published_at.month == 10
    assert doc.published_at.day == 15
    assert doc.metadata["type"] == "journal-article"
    assert doc.metadata["publisher"] == "Test Publisher"
    assert "Alice Smith" in doc.text
    assert "Journal of Testing" in doc.text
    assert "Abstract here." in doc.text
