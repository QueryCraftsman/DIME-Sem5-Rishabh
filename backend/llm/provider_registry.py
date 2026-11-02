"""
DIME Centralized LLM Architecture — Provider Registry & Factory (Phase 2).
"""

from __future__ import annotations

import logging
from typing import Any

from backend.core.config import get_settings
from backend.llm.config import Capability
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.providers.gemini_provider import GeminiProvider
from backend.llm.providers.groq_provider import GroqProvider
from backend.llm.providers.openai_provider import OpenAIProvider
from backend.llm.providers.openrouter_provider import OpenRouterNemotronProvider

logger = logging.getLogger("dime.llm.registry")


class ProviderRegistry:
    """
    Central registry and factory for all configured LLM provider adapters.
    Manages priority ordering, capability matching, and runtime configuration.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self._providers: dict[str, BaseLLMProvider] = {}
        self._initialize_providers()

    def _normalize_name(self, name: str) -> str:
        clean = name.strip().lower()
        if clean in ("openrouter", "nemotron"):
            return "nvidia"
        return clean

    def _initialize_providers(self) -> None:
        """Instantiates all configured providers based on application settings."""
        # 1. Groq (PRIMARY)
        self._providers["groq"] = GroqProvider(
            api_key=self.settings.groq_api_key,
            model_name=self.settings.groq_model_name,
        )

        # 2. Google Gemini (FALLBACK 1)
        self._providers["gemini"] = GeminiProvider(
            api_key=self.settings.google_api_key,
            model_name=self.settings.gemini_model_name,
        )

        # 3. NVIDIA Nemotron / OpenRouter (FALLBACK 2)
        self._providers["nvidia"] = OpenRouterNemotronProvider(
            api_key=self.settings.nvidia_api_key,
            model_name=self.settings.nvidia_model_name,
        )

        # 4. OpenAI (Optional)
        self._providers["openai"] = OpenAIProvider(
            api_key=self.settings.openai_api_key,
            model_name=self.settings.openai_model_name,
        )

    def get_provider(self, name: str) -> BaseLLMProvider | None:
        """Retrieves a provider adapter by normalized name."""
        return self._providers.get(self._normalize_name(name))

    def get_priority_providers(self, required_capability: Capability | None = None) -> list[BaseLLMProvider]:
        """
        Builds the ordered candidate provider list:
        Primary -> Fallback 1 -> Fallback 2 -> Any other configured provider.
        Filters by configuration status and requested capability.
        """
        order: list[str] = []

        # 1. Primary provider
        primary = self._normalize_name(self.settings.llm_primary_provider)
        order.append(primary)

        # 2. Configured fallbacks
        if self.settings.llm_fallback_enabled and self.settings.llm_fallback_providers:
            fallbacks = [
                self._normalize_name(p)
                for p in self.settings.llm_fallback_providers.split(",")
                if p.strip()
            ]
            for fb in fallbacks:
                if fb not in order:
                    order.append(fb)

        # 3. Add any remaining configured providers not explicitly mentioned
        for p_name in ("groq", "gemini", "nvidia", "openai"):
            if p_name not in order:
                order.append(p_name)

        # 4. Resolve and filter candidates
        candidates: list[BaseLLMProvider] = []
        for p_name in order:
            provider = self._providers.get(p_name)
            if provider is None:
                continue

            # Check if API key is present
            if not provider.is_configured():
                logger.debug(f"[Registry] Skipping {p_name}: API key not configured.")
                continue

            # Check capability support
            if required_capability is not None and required_capability not in provider.capabilities:
                logger.debug(f"[Registry] Skipping {p_name}: does not support {required_capability.value}.")
                continue

            candidates.append(provider)

        return candidates

    def get_status(self) -> dict[str, Any]:
        """Provides status details for all registered providers (no credentials leaked)."""
        return {
            name: {
                "name": p.name,
                "model_name": p.model_name,
                "is_configured": p.is_configured(),
                "capabilities": [c.value for c in p.capabilities],
            }
            for name, p in self._providers.items()
        }


# Global singleton registry
provider_registry = ProviderRegistry()

