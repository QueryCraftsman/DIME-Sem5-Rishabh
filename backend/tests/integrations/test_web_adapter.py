"""
Tests for CrawlAdapter and Web Crawling integration.
"""

from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from backend.integrations.web.adapter import CrawlAdapter
from backend.integrations.web.exceptions import (
    CrawlProviderError,
    CrawlRobotsDeniedError,
)
from backend.schemas.source import SourceDocument


@pytest.mark.asyncio
async def test_crawl_adapter_cache_hit():
    """Test that CrawlAdapter returns cached doc if available."""
    adapter = CrawlAdapter()
    test_url = "https://example.com/cache"
    
    # Mock cached document
    doc_dict = {
        "source": "web",
        "source_id": test_url,
        "entity_type": "web_page",
        "title": "Cached Title",
        "text": "Cached Content",
        "url": test_url,
        "metadata": {"content_hash": "testhash"}
    }
    
    with patch("backend.integrations.web.adapter.URLValidator.validate_url"):
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = doc_dict
            
            # Since it's a cache hit, it shouldn't check robots or crawl4ai
            with patch("backend.integrations.web.robots.RobotsChecker.is_allowed", new_callable=AsyncMock) as mock_robots:
                doc = await adapter.acquire_page(test_url)
                
                assert doc is not None
                assert doc.title == "Cached Title"
                mock_robots.assert_not_called()


@pytest.mark.asyncio
async def test_crawl_adapter_robots_denied():
    """Test that CrawlAdapter respects robots.txt denial."""
    adapter = CrawlAdapter()
    test_url = "https://example.com/denied"
    
    with patch("backend.integrations.web.adapter.URLValidator.validate_url"):
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            
            with patch("backend.integrations.web.robots.RobotsChecker.is_allowed", new_callable=AsyncMock) as mock_robots:
                mock_robots.return_value = False
                
                with pytest.raises(CrawlRobotsDeniedError):
                    await adapter.acquire_page(test_url)


@pytest.mark.asyncio
async def test_crawl_adapter_success_no_crawl4ai():
    """Test that CrawlAdapter raises provider error if crawl4ai is missing."""
    adapter = CrawlAdapter()
    test_url = "https://example.com/success"
    
    with patch("backend.integrations.web.adapter.URLValidator.validate_url"):
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            
            with patch("backend.integrations.web.robots.RobotsChecker.is_allowed", new_callable=AsyncMock) as mock_robots:
                mock_robots.return_value = True
                
                # We mock AsyncWebCrawler as None
                with patch("backend.integrations.web.adapter.AsyncWebCrawler", None):
                    with pytest.raises(CrawlProviderError) as exc:
                        await adapter.acquire_page(test_url)
                    assert "package is not installed" in str(exc.value)


@pytest.mark.asyncio
async def test_crawl_adapter_success_mocked_crawl4ai():
    """Test CrawlAdapter executing Crawl4AI and saving to cache."""
    adapter = CrawlAdapter()
    test_url = "https://example.com/mock"
    
    with patch("backend.integrations.web.adapter.URLValidator.validate_url"):
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            
            with patch("backend.integrations.web.robots.RobotsChecker.is_allowed", new_callable=AsyncMock) as mock_robots:
                mock_robots.return_value = True
                
                with patch("backend.core.cache.cache_manager.set", new_callable=AsyncMock) as mock_cache_set:
                    
                    # Create a mock for AsyncWebCrawler instance
                    mock_crawler_instance = AsyncMock()
                    mock_result = MagicMock()
                    mock_result.success = True
                    mock_result.markdown = "Hello World Web"
                    mock_result.metadata = {"title": "Hello Title"}
                    
                    mock_crawler_instance.arun.return_value = mock_result
                    
                    # Create a mock class that returns the instance in __aenter__
                    class MockAsyncWebCrawler:
                        def __init__(self, *args, **kwargs):
                            pass
                        async def __aenter__(self):
                            return mock_crawler_instance
                        async def __aexit__(self, exc_type, exc_val, exc_tb):
                            pass
                            
                    with patch("backend.integrations.web.adapter.AsyncWebCrawler", MockAsyncWebCrawler):
                        doc = await adapter.acquire_page(test_url)
                        
                        assert doc is not None
                        assert doc.source == "web"
                        assert doc.title == "Hello Title"
                        assert doc.text == "Hello World Web"
                        
                        mock_cache_set.assert_called_once()
