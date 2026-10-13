"""
Security and URL validation layer for web acquisition.
Ensures URLs are well-formed and prevents SSRF attacks.
"""

import ipaddress
import socket
from urllib.parse import urlparse

from backend.integrations.web.exceptions import CrawlInvalidURLError, CrawlSSRFBlockedError


class URLValidator:
    """Validates URLs for web crawling to prevent SSRF and scope escape."""

    ALLOWED_SCHEMES = {"http", "https"}
    
    # Internal, private, loopback, and link-local networks.
    # We explicitly block these to prevent SSRF.
    FORBIDDEN_NETWORKS = [
        ipaddress.IPv4Network("127.0.0.0/8"),      # Loopback
        ipaddress.IPv4Network("10.0.0.0/8"),       # Private A
        ipaddress.IPv4Network("172.16.0.0/12"),    # Private B
        ipaddress.IPv4Network("192.168.0.0/16"),   # Private C
        ipaddress.IPv4Network("169.254.0.0/16"),   # Link-local (Cloud Metadata)
        ipaddress.IPv4Network("0.0.0.0/8"),        # Zero net
        ipaddress.IPv6Network("::1/128"),          # IPv6 loopback
        ipaddress.IPv6Network("fc00::/7"),         # IPv6 unique local
        ipaddress.IPv6Network("fe80::/10"),        # IPv6 link-local
    ]

    @staticmethod
    def _is_ip_forbidden(ip_str: str) -> bool:
        """Check if an IP string belongs to a forbidden network."""
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            return False

        for network in URLValidator.FORBIDDEN_NETWORKS:
            if ip_obj in network:
                return True
        return False

    @staticmethod
    def _resolve_hostname(hostname: str) -> list[str]:
        """Resolve a hostname to its IP addresses to check for DNS-level SSRF."""
        try:
            # getaddrinfo returns a list of 5-tuples. The 4th item is a sockaddr tuple (ip, port).
            records = socket.getaddrinfo(hostname, None)
            ips = [record[4][0] for record in records]
            return ips
        except socket.gaierror:
            # If it doesn't resolve, it might be an invalid domain or not DNS-backed.
            # We'll fail safe or allow the subsequent request to fail gracefully.
            return []

    @classmethod
    def validate_url(cls, url: str) -> None:
        """
        Validate a URL for scheme, format, and SSRF restrictions.
        Raises CrawlInvalidURLError or CrawlSSRFBlockedError if invalid.
        """
        if not url:
            raise CrawlInvalidURLError(url, "URL cannot be empty")

        parsed = urlparse(url)
        
        # 1. Scheme Validation
        if parsed.scheme.lower() not in cls.ALLOWED_SCHEMES:
            raise CrawlInvalidURLError(url, f"Unsupported scheme '{parsed.scheme}'. Allowed: {cls.ALLOWED_SCHEMES}")
            
        # 2. Hostname extraction
        hostname = parsed.hostname
        if not hostname:
            raise CrawlInvalidURLError(url, "URL missing hostname")
            
        # 3. Direct IP checking
        if cls._is_ip_forbidden(hostname):
            raise CrawlSSRFBlockedError(url, hostname)
            
        # 4. DNS Resolution checking
        # If the hostname is not an IP literal, resolve it to ensure it doesn't map to localhost/metadata.
        # This prevents attacks where attacker controls a domain (e.g. ssrf.attacker.com) that resolves to 169.254.169.254.
        try:
            ipaddress.ip_address(hostname)
            # If it parsed as IP, we already checked it above.
        except ValueError:
            # It's a hostname. Resolve and check IPs.
            resolved_ips = cls._resolve_hostname(hostname)
            for ip in resolved_ips:
                if cls._is_ip_forbidden(ip):
                    raise CrawlSSRFBlockedError(url, ip)
