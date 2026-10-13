"""
Web Crawl Adapter wrapping Crawl4AI.
Enforces security, caching, robots.txt, and normalization.
"""

import datetime
import hashlib
import logging
from typing import Any

from backend.core.cache import cache_manager
from backend.core.config import get_settings
from backend.integrations.web.exceptions import (
    CrawlProviderError,
    CrawlRobotsDeniedError,
)
from backend.integrations.web.robots import RobotsChecker
from backend.integrations.web.security import URLValidator
from backend.schemas.source import SourceDocument

# Try to import crawl4ai safely so tests can mock it if not installed
try:
    from crawl4ai import AsyncWebCrawler
except ImportError:
    AsyncWebCrawler = None

logger = logging.getLogger(__name__)


class CrawlAdapter:
    """
    Adapter for Crawl4AI.
    Coordinates security validation, robots checks, caching, and execution.
    """

    def __init__(self) -> None:
        self.settings = get_settings()

    def _hash_content(self, text: str) -> str:
        """Compute a SHA-256 hash of the content to identify identical pages."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    async def acquire_page(self, url: str) -> SourceDocument | None:
        """
        Acquire a single web page safely.
        1. Validates the URL scheme and SSRF constraints.
        2. Checks cache.
        3. Checks robots.txt.
        4. Executes Crawl4AI.
        5. Normalizes into SourceDocument and caches.
        """
        if not self.settings.crawl4ai_enabled:
            logger.info("Crawl4AI is disabled in configuration.")
            return None

        # 1. URL Validation (throws CrawlInvalidURLError / CrawlSSRFBlockedError)
        URLValidator.validate_url(url)

        cache_key = f"crawl_{self._hash_content(url)}"

        # 2. Check temporary shared intelligence cache
        cached = await cache_manager.get(cache_key)
        if cached:
            try:
                logger.info(f"Using cached web content for {url}")
                # Reconstruct SourceDocument from dict
                doc = SourceDocument.model_validate(cached)
                return doc
            except Exception as e:
                logger.warning(f"Failed to parse cached crawl result for {url}: {e}")

        # 3. Check robots.txt
        async with RobotsChecker() as robots:
            is_allowed = await robots.is_allowed(url)
            if not is_allowed:
                raise CrawlRobotsDeniedError(url)

        # 4. Execute Crawl4AI
        if AsyncWebCrawler is None:
            raise CrawlProviderError(url, "crawl4ai package is not installed.")

        logger.info(f"Executing Crawl4AI acquisition for {url}")
        try:
            # Note: Crawl4AI's AsyncWebCrawler is an async context manager
            async with AsyncWebCrawler(verbose=False) as crawler:
                # Basic configuration mimicking a standard browser fetch.
                # Avoid expensive JS rendering unless needed, but crawl4ai defaults do a decent job.
                result = await crawler.arun(
                    url=url,
                    word_count_threshold=10,
                    exclude_external_links=True,
                    remove_overlay_elements=True,
                    process_iframes=False
                )
                
                if not result.success:
                    raise CrawlProviderError(url, f"Crawl failed: {result.error_message}")
                
                # Further security check: if the result URL changed (redirected), we should re-validate it.
                # However, crawl4ai might not expose the final URL directly in all versions, or we just validate it.
                # If result exposes redirect information, we'd check it here. 
                # For now, we trust the adapter's initial check, but in a production strict-SSRF scenario,
                # we'd configure the crawler's underlying fetcher to block redirects to internal IPs.
                # Playwright (used by crawl4ai) doesn't natively expose a simple SSRF block, 
                # so we rely on the initial resolution check as our best effort without rewriting playwright internals.

                title = "Untitled Web Page"
                if hasattr(result, "metadata") and result.metadata and "title" in result.metadata:
                    title = result.metadata["title"]
                
                markdown_text = result.markdown
                if not markdown_text:
                    markdown_text = result.cleaned_html or result.html or ""

                content_hash = self._hash_content(markdown_text)

                # 5. Normalize
                doc = SourceDocument(
                    source="web",
                    source_id=url,  # Original canonical URL
                    entity_type="web_page",
                    title=title,
                    text=markdown_text,
                    url=url,
                    retrieved_at=datetime.datetime.now(datetime.timezone.utc),
                    metadata={
                        "original_url": url,
                        "content_hash": content_hash,
                        "extraction_method": "crawl4ai_markdown",
                    }
                )

                # Store in shared cache
                await cache_manager.set(
                    cache_key,
                    doc.model_dump(mode="json"),
                    ttl_seconds=self.settings.crawl_cache_ttl_seconds
                )

                return doc

        except CrawlProviderError:
            raise
        except Exception as e:
            raise CrawlProviderError(url, f"Unexpected error during crawl: {e}")
