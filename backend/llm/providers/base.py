"""
DIME Centralized LLM Architecture — Base HTTP Provider Class.
"""

from __future__ import annotations

import json
import logging
from typing import Type, TypeVar, Any

import httpx
from pydantic import BaseModel

from backend.llm.config import Capability
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.response_validator import ResponseValidator

logger = logging.getLogger("dime.llm.provider.base")

T = TypeVar("T", bound=BaseModel)


class BaseHTTPLLMProvider(BaseLLMProvider):
    """Common foundation for HTTP-based LLM provider adapters."""

    def __init__(
        self,
        name: str,
        model_name: str,
        api_key: str,
        base_url: str | None = None,
        capabilities: set[Capability] | None = None,
    ) -> None:
        self.name = name.lower()
        self.model_name = model_name
        self.api_key = api_key
        self.base_url = base_url
        self.capabilities = capabilities or {
            Capability.TEXT,
            Capability.JSON_MODE,
            Capability.STRUCTURED_OUTPUT,
        }

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def _format_structured_prompt(self, prompt: str, response_model: Type[BaseModel] | str) -> str:
        """Appends explicit schema formatting rules with JSON Schema definition to guarantee compliance."""
        schema_def = ""
        schema_name = "JSON"
        if isinstance(response_model, type) and issubclass(response_model, BaseModel):
            schema_name = response_model.__name__
            try:
                schema_def = f"\nExpected JSON Schema:\n{json.dumps(response_model.model_json_schema(), indent=2)}\n"
            except Exception:
                pass
        elif isinstance(response_model, str):
            schema_name = response_model

        return (
            f"{prompt}\n\n"
            f"[IMPORTANT FORMATTING REQUIREMENT]\n"
            f"You MUST output ONLY a valid, parseable JSON object matching the '{schema_name}' schema. {schema_def}"
            f"Do not include commentary, explanations, or text outside the JSON object."
        )

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        max_tokens: int = 2048,
        timeout_seconds: float = 60.0,
    ) -> T:
        """
        Executes text generation and strictly validates output against response_model.
        """
        formatted_prompt = self._format_structured_prompt(prompt, response_model)
        raw_text = await self.generate_text(
            prompt=formatted_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout_seconds=timeout_seconds,
        )
        return ResponseValidator.validate_structured(raw_text, response_model)

