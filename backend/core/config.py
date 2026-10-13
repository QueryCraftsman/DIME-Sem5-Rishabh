"""
DIME Backend — Application Configuration.

Loads all settings from environment variables using Pydantic Settings.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ───────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"

    # ── Backend ───────────────────────────────────────────────
    backend_secret_key: str = "change-me-in-production"
    backend_cors_origins: str = "http://localhost:3000"

    # ── Database (PostgreSQL) ─────────────────────────────────
    database_url_raw: str = Field(alias="DATABASE_URL", default="postgresql://dime:dime@localhost:5433/dime")

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        """The async URL for SQLAlchemy."""
        if self.database_url_raw.startswith("postgresql://"):
            return self.database_url_raw.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url_raw

    # ── Redis ─────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6381/0"

    # ── Qdrant ────────────────────────────────────────────────
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection_name: str = "dime_chunks"

    # ── GitHub ────────────────────────────────────────────────
    github_token: str = ""
    github_api_url: str = "https://api.github.com"
    github_api_version: str = "2022-11-28"
    github_request_timeout_seconds: float = 10.0
    github_max_search_results: int = 30
    github_max_repository_details: int = 10
    github_max_readmes: int = 5
    github_max_pages: int = 2
    github_max_retries: int = 3
    github_concurrency: int = 3
    github_cache_ttl_seconds: int = 86400

    # ── Research APIs ─────────────────────────────────────────
    # Semantic Scholar
    semantic_scholar_api_key: str = ""
    semantic_scholar_base_url: str = "https://api.semanticscholar.org/graph/v1"
    semantic_scholar_timeout_seconds: float = 10.0
    semantic_scholar_max_results: int = 20
    semantic_scholar_max_retries: int = 3
    semantic_scholar_concurrency: int = 3

    # Crossref
    crossref_base_url: str = "https://api.crossref.org"
    crossref_mailto: str = ""
    crossref_timeout_seconds: float = 10.0
    crossref_max_results: int = 15
    crossref_max_retries: int = 3
    crossref_concurrency: int = 3

    # IEEE Xplore
    ieee_xplore_api_key: str = ""
    ieee_xplore_base_url: str = "https://ieeexploreapi.ieee.org/api/v1/search"
    ieee_xplore_timeout_seconds: float = 10.0
    ieee_xplore_max_results: int = 10
    ieee_xplore_max_retries: int = 3
    ieee_xplore_concurrency: int = 3

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_api_key: str = ""
    groq_api_key: str = ""
    nvidia_api_key: str = ""

    # ── Web Acquisition (Crawl4AI) ────────────────────────────
    crawl4ai_enabled: bool = True
    crawl_request_timeout_seconds: float = 15.0
    crawl_max_redirects: int = 3
    crawl_max_pages_per_job: int = 5
    crawl_max_content_size: int = 5242880  # 5MB
    crawl_max_concurrent_requests: int = 3
    crawl_request_delay_seconds: float = 1.0
    crawl_robots_cache_ttl_seconds: int = 86400
    crawl_cache_ttl_seconds: int = 86400

    # ── Document Intelligence Pipeline (Phase 6) ──────────────
    document_ttl_hours: int = 24
    chunk_size_chars: int = 1000
    chunk_overlap_chars: int = 200

    # ── Object Storage ────────────────────────────────────────
    s3_endpoint: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket_name: str = "dime-artifacts"

    # ── Embedding (Phase 7) ───────────────────────────────────
    embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    embedding_batch_size: int = 32
    embedding_device: str = "cpu"

    # ── Retrieval & Reranking (Phase 8) ───────────────────────
    retrieval_dense_top_k: int = 50
    retrieval_sparse_top_k: int = 50
    retrieval_hybrid_limit: int = 60
    retrieval_final_top_k: int = 15
    reranker_model_name: str = "BAAI/bge-reranker-base"
    reranker_batch_size: int = 32
    reranker_device: str = "cpu"

    # ── AI Agents (Phase 10) ──────────────────────────────────
    llm_provider_name: str = "openai"
    llm_model_name: str = "gpt-4o-mini"
    llm_temperature: float = 0.0
    
    agent_max_research_questions: int = 3
    agent_max_competitor_questions: int = 2
    agent_retrieval_top_k: int = 15

    # ── Pipeline Overhaul: Relevance Thresholds ───────────────
    github_min_relevance: float = 0.55
    paper_min_relevance: float = 0.50
    web_min_relevance: float = 0.55
    github_max_candidate_pool: int = 150
    paper_max_candidate_pool: int = 80
    web_max_candidate_pool: int = 30



    # ── Computed ──────────────────────────────────────────────
    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]

    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def sync_database_url(self) -> str:
        """Synchronous database URL for Alembic migrations."""
        return self.database_url.replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    """Return cached settings singleton."""
    return Settings()
