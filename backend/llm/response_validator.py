"""
DIME Centralized LLM Architecture — Response Validation & Schema Compatibility (Phase 7).
"""

from __future__ import annotations

import json
import logging
import re
from typing import Type, TypeVar, Any

from pydantic import BaseModel, ValidationError

logger = logging.getLogger("dime.llm.validator")

T = TypeVar("T", bound=BaseModel)


class InvalidLLMOutputError(ValueError):
    """Raised when an LLM fails to produce valid structured JSON adhering to the target schema."""
    pass


class ResponseValidator:
    """
    Validates and normalizes raw LLM output into typed Pydantic models.
    Supports markdown fence stripping, first/last brace balancing, and defensive schema validation.
    """

    @staticmethod
    def clean_json_text(text: str) -> str:
        """Strips markdown code blocks, backticks, and extraneous whitespace."""
        cleaned = text.strip()
        
        # 1. Strip markdown fences (```json ... ``` or ``` ...)
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()
            else:
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)

        # 2. Extract bounding braces { ... } or [ ... ]
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            cleaned = cleaned[first_brace : last_brace + 1]

        return cleaned

    @classmethod
    def validate_structured(cls, raw_content: str | dict[str, Any], response_model: Type[T]) -> T:
        """
        Parses and strictly validates raw content against target Pydantic model.
        Never fabricates missing data; raises InvalidLLMOutputError on irrecoverable schema failure.
        """
        # If the provider already returned a parsed dictionary
        if isinstance(raw_content, dict):
            try:
                return response_model.model_validate(raw_content)
            except ValidationError as val_err:
                raise InvalidLLMOutputError(
                    f"Parsed dictionary failed {response_model.__name__} validation: {val_err}"
                ) from val_err

        if not isinstance(raw_content, str) or not raw_content.strip():
            raise InvalidLLMOutputError(f"Received empty response content for model {response_model.__name__}")

        cleaned = cls.clean_json_text(raw_content)

        # 1. Primary standard validation
        try:
            return response_model.model_validate_json(cleaned)
        except (ValidationError, ValueError, json.JSONDecodeError):
            pass

        # 2. Second attempt: loose dict parse
        try:
            parsed_dict = json.loads(cleaned)
            if isinstance(parsed_dict, dict):
                return response_model.model_validate(parsed_dict)
        except (ValidationError, ValueError, json.JSONDecodeError):
            pass

        # 3. Third attempt: repair common trailing commas
        try:
            repaired = re.sub(r",\s*([\]}])", r"\1", cleaned)
            parsed_dict = json.loads(repaired)
            if isinstance(parsed_dict, dict):
                return response_model.model_validate(parsed_dict)
        except Exception as repair_err:
            raise InvalidLLMOutputError(
                f"Failed to parse and validate {response_model.__name__} from LLM response. Error: {repair_err}"
            ) from repair_err

        raise InvalidLLMOutputError(f"Output could not be parsed into {response_model.__name__}")

