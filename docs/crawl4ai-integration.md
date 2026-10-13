# Crawl4AI Integration (Phase 5)

## Overview

The DIME Phase 5 architecture introduces a **Controlled Web Acquisition Layer** using `crawl4ai`.
This layer is specifically designed to fetch web evidence associated with URLs discovered during Phase 3 (GitHub) and Phase 4 (Research APIs).

**Important Constraints:**
- This is an acquisition interface, not an autonomous web-research agent.
- It normalizes public web pages into DIME's common `SourceDocument` format.
- It does not perform internal routing, RAG, embeddings, or scoring.

## Architecture

The integration runs directly within the **Celery Worker** process (`backend/worker/tasks.py`), utilizing asyncio to process multiple HTTP requests without blocking the synchronous Celery execution shell.

The core implementation lives in `backend/integrations/web/`:
- `adapter.py`: `CrawlAdapter` coordinates security, caching, robots.txt, and Crawl4AI.
- `security.py`: `URLValidator` enforces strict URL validation and SSRF defenses.
- `robots.py`: `RobotsChecker` parses and caches `robots.txt` compliance rules.
- `exceptions.py`: Defines the `WebAcquisitionError` hierarchy.

## Security & SSRF Defenses

Due to the inherent risks of fetching arbitrary URLs, Phase 5 enforces a strict Server-Side Request Forgery (SSRF) boundary:

1. **Allowed Schemes**: Only `http` and `https` are permitted. Schemes like `file://` or `ftp://` throw a `CrawlInvalidURLError`.
2. **IP Blacklisting**: The `URLValidator` blocks requests to private networks, loopback addresses, and cloud metadata IPs (e.g. `127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`).
3. **DNS Resolution Checking**: If a hostname is provided, `URLValidator._resolve_hostname()` performs a DNS resolution check prior to fetch, ensuring the domain doesn't map to a blocked IP address (preventing DNS rebinding and internal network probing).

## Robots.txt & Caching

- **Robots.txt**: We use `urllib.robotparser.RobotFileParser`. Because parsing is synchronous and fetching is I/O bound, `httpx.AsyncClient` is used to fetch the file, and the resulting content is cached in Redis via `CacheManager` with a TTL of `CRAWL_ROBOTS_CACHE_TTL_SECONDS`.
- **Content Hashing**: Normalized page content is hashed (SHA-256) and saved in the `metadata` dictionary of the resulting `SourceDocument`.
- **Shared Intelligence Cache**: Successful crawls are stored in Redis (`cache_manager`) using a hashed URL key. If a URL is requested again within the TTL, the cached `SourceDocument` is returned directly, avoiding network overhead.

## Configuration
Controlled through `backend/core/config.py` and environment variables:
- `CRAWL4AI_ENABLED`: Master toggle.
- `CRAWL_MAX_CONCURRENT_REQUESTS`: Concurrent outbound Crawl4AI contexts.
- `CRAWL_REQUEST_TIMEOUT_SECONDS`: Request timeout.
- `CRAWL_MAX_PAGES_PER_JOB`: Hard limit on the number of URLs crawled per analysis pipeline execution.
- `CRAWL_MAX_CONTENT_SIZE`: Failsafe limit for HTML/Markdown payload.
