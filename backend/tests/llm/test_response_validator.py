"""
Tests for LLM Response Validator.
"""

import pytest
from pydantic import BaseModel, Field

from backend.llm.response_validator import ResponseValidator, InvalidLLMOutputError


class DummyModel(BaseModel):
    name: str
    count: int = Field(ge=0)
    tags: list[str] = Field(default_factory=list)


def test_validate_clean_json() -> None:
    raw = '{"name": "Valid Test", "count": 10, "tags": ["a", "b"]}'
    res = ResponseValidator.validate_structured(raw, DummyModel)
    assert res.name == "Valid Test"
    assert res.count == 10
    assert res.tags == ["a", "b"]


def test_validate_markdown_fenced_json() -> None:
    raw = """
    Here is your requested output:
    ```json
    {
        "name": "Markdown Test",
        "count": 5,
        "tags": ["ai"]
    }
    ```
    Thank you!
    """
    res = ResponseValidator.validate_structured(raw, DummyModel)
    assert res.name == "Markdown Test"
    assert res.count == 5


def test_validate_trailing_comma_repair() -> None:
    raw = '{"name": "Repair Test", "count": 2, "tags": ["x",],}'
    res = ResponseValidator.validate_structured(raw, DummyModel)
    assert res.name == "Repair Test"
    assert res.count == 2


def test_validate_invalid_schema_raises() -> None:
    raw = '{"name": "Bad", "count": -5}'  # count must be ge=0
    with pytest.raises(InvalidLLMOutputError):
        ResponseValidator.validate_structured(raw, DummyModel)


def test_validate_malformed_json_raises() -> None:
    raw = 'not a json at all'
    with pytest.raises(InvalidLLMOutputError):
        ResponseValidator.validate_structured(raw, DummyModel)

