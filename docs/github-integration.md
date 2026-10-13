# DIME GitHub Integration (Phase 3)

This document describes the Phase 3 GitHub Integration for DIME V1.

## 1. Architecture
The integration follows a strict layered architecture:
- **`GitHubClient`** (`client.py`): Handles raw HTTP/API interactions with `httpx.AsyncClient`. Responsible for timeouts, caching (ETags), exceptions, and rate limit responses.
- **`GitHubService`** (`service.py`): DIME's application logic layer. Converts ideas into deterministic queries, handles pagination budgets, concurrent fetching, and deduplicates repositories across searches.
- **`GitHubAdapter`** (`adapter.py`): Pure transformation layer parsing GitHub JSON into DIME's source-agnostic `SourceDocument` schema.

## 2. Required Environment Variables
Configure these in your `.env`:
```env
GITHUB_TOKEN=your_pat_here
GITHUB_API_URL=https://api.github.com
GITHUB_API_VERSION=2022-11-28
GITHUB_REQUEST_TIMEOUT_SECONDS=10
GITHUB_MAX_SEARCH_RESULTS=30
GITHUB_MAX_REPOSITORY_DETAILS=10
GITHUB_MAX_READMES=5
GITHUB_MAX_PAGES=2
GITHUB_MAX_RETRIES=3
GITHUB_CONCURRENCY=3
GITHUB_CACHE_TTL_SECONDS=86400
```
*Note: Never commit your real `GITHUB_TOKEN`.*

## 3. Authentication Setup
The `GitHubClient` injects the token into an `Authorization: Bearer <TOKEN>` header. If the token is missing, the client degrades gracefully but is severely rate-limited by GitHub (unauthenticated).

## 4. How GitHub Search Works
`GitHubService._generate_queries` deterministically splits an idea into 2-3 focused text queries. It then queries the GitHub Search API for each. Cross-query duplicate repositories are dropped locally using the repository ID.

## 5. Request/Result Budgets
To prevent runaway queries, the service stops requesting pages or searches once it accumulates `GITHUB_MAX_SEARCH_RESULTS` across queries, or hits `GITHUB_MAX_PAGES` per query. README details are similarly bounded (`GITHUB_MAX_READMES`), picking only the top repositories ranked by stars.

## 6. Rate-Limit Behavior
The integration respects:
- **Primary limits:** If `x-ratelimit-remaining` hits zero, the client raises `GitHubRateLimitExceeded`. The service catches this and stops gracefully, returning partial results.
- **Secondary limits / 5xx:** Managed by `tenacity` with exponential backoff up to `GITHUB_MAX_RETRIES`. Raises `GitHubSecondaryRateLimitError` on exhaustion.

## 7. Conditional Requests
The client supports `ETag` checking via the `CacheManager`. If a resource is fetched, its JSON and `ETag` are stored. On subsequent requests, `If-None-Match: <etag>` is sent. A `304 Not Modified` returns the cached version.

## 8. Temporary Caching Behavior
We respect DIME's design by not polluting PostgreSQL prematurely. The Celery worker currently caches the raw `SourceDocument` representation in Redis for up to `GITHUB_CACHE_TTL_SECONDS` to simulate handing it off to Phase 6 normalization without saving a permanent warehouse copy.

## 9. Running Tests
Unit tests are fully mocked (no live network calls):
```bash
cd backend
.venv\Scripts\pytest tests\integrations\test_github.py -v
```

## 10. Example Development Request
You can trigger the pipeline (including GitHub integration) locally by POSTing to the Analysis API:
```bash
curl -X POST http://localhost:8000/api/v1/analyses/ \
    -H "Content-Type: application/json" \
    -d '{"idea": "AI student recommendation engine"}'
```
Check the worker logs to see the GitHub results.
