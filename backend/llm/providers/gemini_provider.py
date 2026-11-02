"""
DIME Centralized LLM Architecture — Google Gemini Provider Adapter (Fallback 1).
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from backend.llm.config import Capability
from backend.llm.providers.base import BaseHTTPLLMProvider

logger = logging.getLogger("dime.llm.gemini")


class GeminiProvider(BaseHTTPLLMProvider):
    """
    Google Gemini provider adapter (via Google AI Studio).
    Configured as DIME's FALLBACK 1 engine.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-3.5-flash",
        base_url: str = "https://generativelanguage.googleapis.com/v1beta",
    ) -> None:
        super().__init__(
            name="gemini",
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
        """Executes completion via Gemini REST API."""
        endpoint = f"{self.base_url}/models/{self.model_name}:generateContent"
        params = {"key": self.api_key}
        headers = {"Content-Type": "application/json"}

        combined_msg = f"{system_prompt} {prompt}".lower()
        generation_config: dict[str, Any] = {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "thinkingConfig": {"thinkingBudget": 0},
        }
        if "json" in combined_msg:
            generation_config["responseMimeType"] = "application/json"

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": generation_config,
        }

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            resp = await client.post(
                endpoint,
                params=params,
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("Gemini returned empty candidate array")

            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                finish_reason = candidates[0].get("finishReason", "UNKNOWN")
                raise ValueError(f"Gemini candidate contains no content parts (finishReason: {finish_reason})")

            text_parts = [p.get("text", "") for p in parts if "text" in p]
            return "".join(text_parts).strip()

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
            logger.warning(f"Gemini health check probe failed: {e}")
            return False

