"""
DIME Centralized LLM Architecture — Base Provider Interface (Phase 2 & 5).
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Type, TypeVar, Any

from pydantic import BaseModel

from backend.llm.config import Capability

T = TypeVar("T", bound=BaseModel)


class BaseLLMProvider(ABC):
    """Abstract interface that every LLM provider adapter must implement."""

    name: str
    model_name: str
    capabilities: set[Capability]

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the provider has valid API credentials configured."""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        max_tokens: int = 2048,
        timeout_seconds: float = 60.0,
    ) -> str:
        """Executes a direct completion and returns the raw text output."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        timeout_seconds: float = 60.0,
    ) -> T:
        """Executes completion and returns a validated Pydantic model instance."""
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Executes a lightweight probe to verify connectivity and credentials."""
        pass

