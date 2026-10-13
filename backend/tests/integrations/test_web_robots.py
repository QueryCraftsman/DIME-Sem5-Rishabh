"""
Tests for Robots.txt compliance and caching.
"""

from unittest.mock import AsyncMock, patch

import httpx
import pytest

from backend.integrations.web.robots import RobotsChecker


@pytest.mark.asyncio
async def test_robots_checker_allow():
    """Test standard allow from robots.txt."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=200, 
            text="User-agent: *\nAllow: /", 
            request=httpx.Request("GET", "https://test")
        )

        # Mock cache miss
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            
            with patch("backend.core.cache.cache_manager.set", new_callable=AsyncMock):
                async with RobotsChecker() as checker:
                    allowed = await checker.is_allowed("http://example.com/some/path")
                    assert allowed is True


@pytest.mark.asyncio
async def test_robots_checker_disallow():
    """Test standard disallow from robots.txt."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=200, 
            text="User-agent: *\nDisallow: /private", 
            request=httpx.Request("GET", "https://test")
        )

        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            with patch("backend.core.cache.cache_manager.set", new_callable=AsyncMock):
                async with RobotsChecker() as checker:
                    allowed = await checker.is_allowed("http://example.com/private/data")
                    assert allowed is False


@pytest.mark.asyncio
async def test_robots_checker_cache_hit():
    """Test cache hit avoids network request."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        # Mock cache hit
        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = {"content": "User-agent: *\nDisallow: /"}
            
            async with RobotsChecker() as checker:
                allowed = await checker.is_allowed("http://example.com/some/path")
                assert allowed is False
                
                # Should not have made a network request
                mock_get.assert_not_called()


@pytest.mark.asyncio
async def test_robots_checker_404_allow():
    """Test 404 response implies full allowance."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=404, 
            text="Not Found", 
            request=httpx.Request("GET", "https://test")
        )

        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            with patch("backend.core.cache.cache_manager.set", new_callable=AsyncMock):
                async with RobotsChecker() as checker:
                    allowed = await checker.is_allowed("http://example.com/any/path")
                    assert allowed is True


@pytest.mark.asyncio
async def test_robots_checker_500_disallow():
    """Test 5xx response defaults to disallow."""
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = httpx.Response(
            status_code=500, 
            text="Server Error", 
            request=httpx.Request("GET", "https://test")
        )

        with patch("backend.core.cache.cache_manager.get", new_callable=AsyncMock) as mock_cache_get:
            mock_cache_get.return_value = None
            with patch("backend.core.cache.cache_manager.set", new_callable=AsyncMock):
                async with RobotsChecker() as checker:
                    allowed = await checker.is_allowed("http://example.com/any/path")
                    assert allowed is False
