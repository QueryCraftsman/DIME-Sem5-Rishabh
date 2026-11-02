"""
DIME Centralized LLM Architecture — OpenAI Provider Adapter.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from backend.llm.config import Capability
from backend.llm.providers.base import BaseHTTPLLMProvider

logger = logging.getLogger("dime.llm.openai")


class OpenAIProvider(BaseHTTPLLMProvider):
    """
    Standard OpenAI API provider adapter.
    Optional backup provider if OPENAI_API_KEY is configured.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "gpt-4o-mini",
        base_url: str = "https://api.openai.com/v1",
    ) -> None:
        super().__init__(
            name="openai",
            model_name=model_name,
            api_key=api_key,
            base_url=base_url,
            capabilities={
                Capability.TEXT,
                Capability.JSON_MODE,
                Capability.STRUCTURED_OUTPUT,
                Capability.STREAMING,
            },
        )

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str = "You are an analytical AI assistant.",
        temperature: float = 0.0,
        max_tokens: int = 2048,
        timeout_seconds: float = 60.0,
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"] or ""

    async def health_check(self) -> bool:
        if not self.is_configured():
            return False
        try:
            res = await self.generate_text(
                prompt="ping",
                system_prompt="respond with {'status': 'ok'}",
                max_tokens=10,
                timeout_seconds=5.0,
            )
            return bool(res)
        except Exception:
            return False

