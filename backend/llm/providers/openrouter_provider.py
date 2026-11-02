"""
DIME Centralized LLM Architecture — OpenRouter / NVIDIA Nemotron Provider Adapter (Fallback 2).
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from backend.llm.config import Capability
from backend.llm.providers.base import BaseHTTPLLMProvider

logger = logging.getLogger("dime.llm.openrouter")


class OpenRouterNemotronProvider(BaseHTTPLLMProvider):
    """
    OpenRouter API provider adapter targeting NVIDIA Nemotron Ultra / Lightning.
    Configured as DIME's FALLBACK 2 engine.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "nvidia/nemotron-3.5-lightning:free",
        base_url: str = "https://openrouter.ai/api/v1",
    ) -> None:
        super().__init__(
            name="nvidia",
            model_name=model_name,
            api_key=api_key,
            base_url=base_url,
            capabilities={
                Capability.TEXT,
                Capability.JSON_MODE,
                Capability.STRUCTURED_OUTPUT,
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
        """Executes completion via OpenRouter completions endpoint."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://dime.platform",
            "X-Title": "DIME Product Intelligence",
            "Content-Type": "application/json",
        }

        combined_msg = f"{system_prompt} {prompt}".lower()
        payload: dict[str, Any] = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "reasoning": {"effort": "none"},
        }
        if "json" in combined_msg:
            payload["response_format"] = {"type": "json_object"}

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
        """Lightweight connectivity probe."""
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
        except Exception as e:
            logger.warning(f"OpenRouter/Nemotron health check probe failed: {e}")
            return False

