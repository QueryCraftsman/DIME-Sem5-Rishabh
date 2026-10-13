"""
Tests for Web URL Security and SSRF validation.
"""

import pytest

from backend.integrations.web.exceptions import CrawlInvalidURLError, CrawlSSRFBlockedError
from backend.integrations.web.security import URLValidator


def test_valid_urls():
    """Ensure standard URLs pass validation."""
    URLValidator.validate_url("http://example.com")
    URLValidator.validate_url("https://example.com/path?query=1")


def test_invalid_scheme():
    """Ensure invalid schemes are blocked."""
    with pytest.raises(CrawlInvalidURLError):
        URLValidator.validate_url("file:///etc/passwd")
    
    with pytest.raises(CrawlInvalidURLError):
        URLValidator.validate_url("ftp://example.com")


def test_ssrf_direct_ips():
    """Ensure forbidden IPs are blocked."""
    forbidden_ips = [
        "127.0.0.1",
        "10.0.0.1",
        "172.16.0.5",
        "192.168.1.1",
        "169.254.169.254", # Cloud metadata
        "::1",
    ]
    
    for ip in forbidden_ips:
        if ":" in ip:
            url = f"http://[{ip}]/"
        else:
            url = f"http://{ip}/"
        with pytest.raises(CrawlSSRFBlockedError):
            URLValidator.validate_url(url)


def test_ssrf_dns_resolution(monkeypatch):
    """Ensure DNS resolution checks block SSRF via domain names."""
    
    def mock_resolve(hostname):
        if hostname == "malicious.internal":
            return ["10.0.0.5"]
        if hostname == "safe.example.com":
            return ["93.184.216.34"]
        return []
        
    monkeypatch.setattr(URLValidator, "_resolve_hostname", mock_resolve)
    
    # Should block the internal resolution
    with pytest.raises(CrawlSSRFBlockedError):
        URLValidator.validate_url("http://malicious.internal/")
        
    # Should allow the safe resolution
    URLValidator.validate_url("https://safe.example.com/")


def test_malformed_url():
    """Ensure badly malformed URLs are handled."""
    with pytest.raises(CrawlInvalidURLError):
        URLValidator.validate_url("http://")
    
    with pytest.raises(CrawlInvalidURLError):
        URLValidator.validate_url("")
