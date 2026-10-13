"""
DIME Backend - Scoring Pydantic Models
"""

from pydantic import BaseModel, Field
from enum import Enum
from typing import Any

class ScoreStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    COMPUTED = "COMPUTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    ERROR = "ERROR"

class ScoreResult(BaseModel):
    metric: str
    score: float | None = None
    status: ScoreStatus
    scale: str = "0-100"
    inputs: dict[str, Any] = Field(default_factory=dict)
    evidence_references: list[str] = Field(default_factory=list)
    explanation: str
    calculation_version: str = "v1"
