"""
DIME Backend — API v1 Router.

Aggregates all v1 route modules into a single router.
"""

from __future__ import annotations

from fastapi import APIRouter

from backend.api.v1 import health

api_v1_router = APIRouter(prefix="/api/v1")

# ── System ──────────────────────────────────────────────────
api_v1_router.include_router(health.router)

# ── Future route modules ────────────────────────────────────
from backend.api.v1 import analyses
api_v1_router.include_router(analyses.router, prefix="/analyses", tags=["analyses"])

from backend.api.v1 import ideas
api_v1_router.include_router(ideas.router, prefix="/ideas", tags=["ideas"])

from backend.api.v1 import comparisons
api_v1_router.include_router(comparisons.router, prefix="/comparisons", tags=["comparisons"])


