"""
DIME Backend — API v1 Health / System endpoints.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from backend.core.config import get_settings

router = APIRouter(tags=["system"])


@router.get("/health")
async def health_check() -> dict:
    """Basic liveness probe."""
    return {
        "status": "healthy",
        "service": "dime-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
async def readiness_check() -> dict:
    """
    Readiness probe — checks that core dependencies are reachable.

    For Phase 0 this is a simple pass-through.
    Phase 1+ will verify PostgreSQL, Redis, and Qdrant connectivity.
    """
    settings = get_settings()
    return {
        "status": "ready",
        "environment": settings.environment,
        "services": {
            "database": "unchecked",  # Phase 1: actual ping
            "redis": "unchecked",
            "qdrant": "unchecked",
        },
    }


@router.get("/config/sources")
async def source_status() -> dict:
    """
    Report which external data sources are configured.

    This allows the frontend to show which sources are available
    before starting an analysis.
    """
    settings = get_settings()
    return {
        "github": bool(settings.github_token),
        "ieee_xplore": bool(settings.ieee_xplore_api_key),
        "semantic_scholar": bool(settings.semantic_scholar_api_key),
        "openai": bool(settings.openai_api_key),
        "anthropic": bool(settings.anthropic_api_key),
        "google": bool(settings.google_api_key),
    }
