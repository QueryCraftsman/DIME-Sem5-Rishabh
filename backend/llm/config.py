"""
DIME Centralized LLM Architecture — Routing & Provider Configurations.
"""

from __future__ import annotations

from enum import Enum
from typing import NamedTuple


class LLMProviderType(str, Enum):
    """Supported LLM Providers."""
    GROQ = "groq"
    GEMINI = "gemini"
    NVIDIA = "nvidia"
    OPENROUTER = "openrouter"
    OPENAI = "openai"


class Capability(str, Enum):
    """Capabilities supported by LLM providers."""
    TEXT = "text"
    JSON_MODE = "json_mode"
    STRUCTURED_OUTPUT = "structured_output"
    STREAMING = "streaming"


class ProviderConfig(NamedTuple):
    """Runtime configuration for an LLM provider."""
    name: str
    model_name: str
    api_key: str
    base_url: str | None = None
    timeout_seconds: float = 60.0
    max_retries: int = 2
    capabilities: set[Capability] = {Capability.TEXT, Capability.JSON_MODE, Capability.STRUCTURED_OUTPUT}

