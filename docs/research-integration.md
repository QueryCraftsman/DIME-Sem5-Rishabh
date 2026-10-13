# Research Integration Architecture

## Overview
DIME integrates with three primary bibliographic and academic research APIs in Phase 4:
1. **Semantic Scholar** (AI/ML focused, rich citations)
2. **Crossref** (Broad academic metadata, polite pool usage)
3. **IEEE Xplore** (Engineering, computer science, technical specifications)

The integration is entirely HTTP-based without requiring bulky third-party SDKs, ensuring full asynchronous compatibility via `httpx`.

## Key Components

### 1. HTTP Clients (`*_client.py`)
Each provider has a dedicated asynchronous client:
- `SemanticScholarClient`
- `CrossrefClient`
- `IEEEXploreClient`

**Features:**
- Automatic rate limit handling (`429` / `403` when appropriate).
- Transient error retries via `tenacity` with exponential backoff (e.g. 500, 502, 503, 504).
- Safe timeout thresholds (default 10s).
- Targeted field selection (e.g., `select=...` or specific query parameters) to minimize JSON payload sizes and parsing overhead.

### 2. Adapters (`*_adapter.py`)
Each provider's arbitrary JSON schema is aggressively coerced into a unified `SourceDocument` Pydantic model (`backend.schemas.source.SourceDocument`).

**Fields Mapped:**
- `source`: The provider name.
- `source_id`: DOI, paper ID, or article number.
- `entity_type`: Fixed as `paper`.
- `title`, `text` (combined abstract/authors/venue), `url`, `published_at`.
- `metadata`: Flexible payload containing provider-specific information (citation count, publisher, raw authors).

### 3. Research Service (`service.py`)
The orchestrator that drives evidence acquisition from research APIs.
- Generates a deterministic keyword-based query from the user's raw idea text.
- Fires requests to all three clients **concurrently** via `asyncio.gather`.
- Grabs successful results while safely swallowing and logging isolated provider failures to avoid killing the whole job (via `return_exceptions=True`).
- **Deduplication:** Merges results based on matching DOIs or title collisions across the three engines, prioritizing the first provider that returned it.

### 4. Schemas
- `ResearchSearchResult`: Similar to GitHub results, tracks documents returned, partial failures, rate limits, and which providers were successfully queried.

## Configuration
All configuration variables are securely managed via `config.py` and `.env`:
- `SEMANTIC_SCHOLAR_API_KEY`
- `CROSSREF_MAILTO` (Critical for Crossref Polite Pool access)
- `IEEE_XPLORE_API_KEY`

Along with concurrency limits and retry counts.

## Celery Worker Integration
In `backend/worker/tasks.py`, the analysis pipeline sequentially fetches GitHub evidence, followed by Research Evidence. The `SourceDocument` outputs are serialized to JSON and pushed to Redis cache for retrieval and LLM processing in later phases.
