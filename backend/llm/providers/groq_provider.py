"""
DIME Centralized LLM Architecture — Groq Provider Adapter (Primary Provider).
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from backend.llm.config import Capability
from backend.llm.providers.base import BaseHTTPLLMProvider

logger = logging.getLogger("dime.llm.groq")


class GroqProvider(BaseHTTPLLMProvider):
    """
    Groq API provider adapter.
    High-speed inference provider configured as DIME's PRIMARY LLM engine.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str = "qwen/qwen3.8-27b",
        base_url: str = "https://api.groq.com/openai/v1",
    ) -> None:
        super().__init__(
            name="groq",
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
        """Executes completion via Groq chat completions endpoint."""
        # 1. Attempt using official Groq Async SDK if available
        combined_msg = f"{system_prompt} {prompt}".lower()
        try:
            import groq
            client = groq.AsyncGroq(api_key=self.api_key)
            kwargs: dict[str, Any] = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                "temperature": temperature,
                "max_tokens": max_tokens,
                "timeout": timeout_seconds,
            }
            if "json" in combined_msg:
                kwargs["response_format"] = {"type": "json_object"}
            completion = await client.chat.completions.create(**kwargs)
            choice = completion.choices[0]
            return choice.message.content or ""
        except ImportError:
            pass  # Fall back to direct HTTP REST execution
        except Exception as groq_err:
            # Re-raise for centralized classifier
            raise groq_err

        # 2. HTTP REST fallback
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
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
            logger.warning(f"Groq health check probe failed: {e}")
            return False

