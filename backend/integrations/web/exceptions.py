"""
Exceptions for Web Acquisition (Crawl4AI) Integration.
"""

from backend.core.exceptions import DimeError


class WebAcquisitionError(DimeError):
    """Base exception for all web acquisition errors."""
    pass


class CrawlInvalidURLError(WebAcquisitionError):
    """Raised when a URL is malformed, uses an invalid scheme, or violates SSRF rules."""
    def __init__(self, url: str, reason: str = "Invalid URL") -> None:
        super().__init__(f"{reason}: {url}")


class CrawlSSRFBlockedError(CrawlInvalidURLError):
    """Raised when a URL resolves to a forbidden private or loopback IP."""
    def __init__(self, url: str, ip: str) -> None:
        super().__init__(url, f"SSRF blocked. Host resolved to forbidden IP {ip}")


class CrawlRobotsDeniedError(WebAcquisitionError):
    """Raised when crawling a URL is forbidden by robots.txt."""
    def __init__(self, url: str) -> None:
        super().__init__(f"Crawling forbidden by robots.txt for URL: {url}")


class CrawlTimeoutError(WebAcquisitionError):
    """Raised when a crawl request times out."""
    def __init__(self, url: str) -> None:
        super().__init__(f"Request timed out for URL: {url}")


class CrawlSizeExceededError(WebAcquisitionError):
    """Raised when the content of a page exceeds configured size limits."""
    def __init__(self, url: str, limit_bytes: int) -> None:
        super().__init__(f"Content size exceeded limit ({limit_bytes} bytes) for URL: {url}")


class CrawlProviderError(WebAcquisitionError):
    """Raised for underlying Crawl4AI or network connection errors (4xx, 5xx, or generic fetch failures)."""
    def __init__(self, url: str, message: str) -> None:
        super().__init__(f"Provider error for {url}: {message}")
