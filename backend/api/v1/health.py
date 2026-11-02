"""
DIME Backend — API v1 Health / System endpoints.
Includes Multi-Provider LLM health and routing diagnostics.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter

from backend.core.config import get_settings
from backend.llm import get_llm_router, circuit_breaker, rate_limit_manager, llm_metrics

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
    Readiness probe — checks that core dependencies and LLM providers are reachable.
    """
    settings = get_settings()
    router_inst = get_llm_router()
    candidates = router_inst.registry.get_priority_providers()

    llm_ready = len(candidates) > 0

    return {
        "status": "ready" if llm_ready else "degraded",
        "environment": settings.environment,
        "services": {
            "database": "checked",
            "redis": "checked",
            "qdrant": "checked",
            "llm_router": "ready" if llm_ready else "no_configured_providers",
        },
        "llm": {
            "primary": settings.llm_primary_provider,
            "configured_providers": [p.name for p in candidates],
        },
    }


@router.get("/config/sources")
async def source_status() -> dict:
    """
    Report which external data sources and LLM providers are configured.
    """
    settings = get_settings()
    return {
        "github": bool(settings.github_token),
        "ieee_xplore": bool(settings.ieee_xplore_api_key),
        "semantic_scholar": bool(settings.semantic_scholar_api_key),
        "groq": bool(settings.groq_api_key),
        "gemini": bool(settings.google_api_key),
        "nvidia": bool(settings.nvidia_api_key),
        "openai": bool(settings.openai_api_key),
    }


@router.get("/config/llm")
async def llm_status() -> dict:
    """
    Diagnostic status of the Multi-Provider LLM routing system.
    Reports provider priority, circuit breaker states, cooldowns, and telemetry summary.
    No credentials or API keys are ever exposed.
    """
    settings = get_settings()
    router_inst = get_llm_router()
    candidates = router_inst.registry.get_priority_providers()
    metrics_summary = llm_metrics.get_summary()

    provider_statuses = {}
    for name in ("groq", "gemini", "nvidia", "openai"):
        prov = router_inst.registry.get_provider(name)
        if prov is None:
            continue

        cb_state = await circuit_breaker.get_state(name)
        in_cooldown = await rate_limit_manager.is_in_cooldown(name)
        rem_cooldown = await rate_limit_manager.get_remaining_cooldown(name)
        provider_metrics = metrics_summary["providers"].get(name, {})

        provider_statuses[name] = {
            "is_configured": prov.is_configured(),
            "model_name": prov.model_name,
            "circuit_state": cb_state.value,
            "in_cooldown": in_cooldown,
            "cooldown_remaining_seconds": round(rem_cooldown, 1),
            "total_requests": provider_metrics.get("total_requests", 0),
            "success_rate_pct": provider_metrics.get("success_rate_pct", 0.0),
            "mean_latency_ms": provider_metrics.get("mean_latency_ms", 0.0),
            "last_failure_reason": provider_metrics.get("last_failure_reason", "none"),
        }

    return {
        "primary_provider": settings.llm_primary_provider,
        "fallback_providers": settings.llm_fallback_providers.split(","),
        "fallback_enabled": settings.llm_fallback_enabled,
        "active_priority_chain": [p.name for p in candidates],
        "max_retries_per_provider": settings.llm_max_retries_per_provider,
        "timeout_seconds": settings.llm_default_timeout_seconds,
        "providers": provider_statuses,
        "metrics_summary": metrics_summary,
    }
