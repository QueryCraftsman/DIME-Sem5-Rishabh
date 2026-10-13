"""
DIME Backend - LLM Provider (Phase 10).
"""

import logging
import re
import json
from typing import TypeVar, Type, cast

from pydantic import BaseModel
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.language_models import BaseChatModel

from backend.core.config import get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMProvider:
    """
    Wrapper around multiple LLM providers (OpenAI, Groq, Gemini, Nvidia)
    using LangChain's structured output capabilities.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.provider_name = self.settings.llm_provider_name.lower()
        self.model_name = self.settings.llm_model_name
        self.temperature = self.settings.llm_temperature
        self.llm = self._initialize_llm()

    def _initialize_llm(self) -> BaseChatModel:
        """Initialize the requested LangChain LLM."""
        if self.provider_name == "openai":
            from langchain_openai import ChatOpenAI
            if not self.settings.openai_api_key:
                logger.warning("OPENAI_API_KEY is not set.")
            return ChatOpenAI(
                api_key=self.settings.openai_api_key,
                model=self.model_name,
                temperature=self.temperature
            )
            
        elif self.provider_name == "groq":
            from langchain_openai import ChatOpenAI
            if not self.settings.groq_api_key:
                logger.warning("GROQ_API_KEY is not set.")
            return ChatOpenAI(
                api_key=self.settings.groq_api_key,
                base_url="https://api.groq.com/openai/v1",
                model=self.model_name,
                temperature=self.temperature
            )
            
        elif self.provider_name == "nvidia":
            from langchain_openai import ChatOpenAI
            if not self.settings.nvidia_api_key:
                logger.warning("NVIDIA_API_KEY is not set.")
            return ChatOpenAI(
                api_key=self.settings.nvidia_api_key,
                base_url="https://openrouter.ai/api/v1",
                model=self.model_name,
                temperature=self.temperature
            )
            
        elif self.provider_name == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI
            if not self.settings.google_api_key:
                logger.warning("GOOGLE_API_KEY is not set.")
            return ChatGoogleGenerativeAI(
                api_key=self.settings.google_api_key,
                model=self.model_name,
                temperature=self.temperature
            )
            
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider_name}")


    def _extract_model_from_text(self, text: str, response_model: Type[T]) -> T:
        """Helper to extract and validate Pydantic model from raw LLM text."""
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1:
            cleaned = cleaned[first_brace:last_brace + 1]
            
        return response_model.model_validate_json(cleaned)

    async def structured_generate(
        self, 
        prompt: str, 
        response_model: Type[T],
        system_prompt: str = "You are an analytical AI assistant."
    ) -> T:
        """
        Generates a structured Pydantic response from the configured LLM.
        """
        try:
            structured_llm = self.llm.with_structured_output(response_model, include_raw=True)
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=prompt)
            ]
            
            res_dict = await structured_llm.ainvoke(messages)
            
            # 1. Direct parsed match
            if isinstance(res_dict, dict) and res_dict.get("parsed") is not None:
                parsed = res_dict["parsed"]
                if isinstance(parsed, response_model):
                    return parsed
                if isinstance(parsed, dict):
                    return response_model.model_validate(parsed)
                return cast(T, parsed)
                
            if isinstance(res_dict, response_model):
                return res_dict

            # 2. Fallback: Parse from raw message content
            raw_msg = res_dict.get("raw") if isinstance(res_dict, dict) else None
            raw_text = getattr(raw_msg, "content", None) if raw_msg else None
            if isinstance(raw_text, str) and raw_text.strip():
                try:
                    return self._extract_model_from_text(raw_text, response_model)
                except Exception as parse_err:
                    logger.warning(f"Failed to parse raw text into {response_model.__name__}: {parse_err}")

            # 3. Direct raw ainvoke fallback if needed
            raw_invoke = await self.llm.ainvoke(messages)
            if hasattr(raw_invoke, "content") and isinstance(raw_invoke.content, str):
                return self._extract_model_from_text(raw_invoke.content, response_model)

            raise ValueError(f"LLM returned None for structured output ({self.provider_name}).")
            
        except Exception as e:
            logger.error(f"Error generating structured output from {self.provider_name}: {e}")
            raise
