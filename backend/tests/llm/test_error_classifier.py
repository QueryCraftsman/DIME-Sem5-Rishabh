"""
Tests for Centralized LLM Error Classifier.
"""

import asyncio
import pytest
import httpx

from backend.llm.error_classifier import classify_error, ErrorCategory


def test_classify_http_429() -> None:
    req = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    resp = httpx.Response(status_code=429, headers={"Retry-After": "45"}, request=req)
    exc = httpx.HTTPStatusError("Rate limited", request=req, response=resp)

    classified = classify_error(exc)
    assert classified.category == ErrorCategory.RATE_LIMITED
    assert classified.status_code == 429
    assert classified.retry_after_seconds == 45.0
    assert classified.should_failover is True
    assert classified.is_retryable_on_same_provider is False


def test_classify_http_503() -> None:
    req = httpx.Request("POST", "https://generativelanguage.googleapis.com")
    resp = httpx.Response(status_code=503, request=req)
    exc = httpx.HTTPStatusError("Service Unavailable", request=req, response=resp)

    classified = classify_error(exc)
    assert classified.category == ErrorCategory.SERVICE_UNAVAILABLE
    assert classified.status_code == 503
    assert classified.should_failover is True
    assert classified.is_retryable_on_same_provider is True


def test_classify_http_500() -> None:
    req = httpx.Request("POST", "https://openrouter.ai/api/v1")
    resp = httpx.Response(status_code=500, request=req)
    exc = httpx.HTTPStatusError("Internal Server Error", request=req, response=resp)

    classified = classify_error(exc)
    assert classified.category == ErrorCategory.SERVER_ERROR
    assert classified.status_code == 500


def test_classify_timeout() -> None:
    exc = asyncio.TimeoutError("Request timed out")
    classified = classify_error(exc)
    assert classified.category == ErrorCategory.TIMEOUT
    assert classified.should_failover is True
    assert classified.is_retryable_on_same_provider is True


def test_classify_auth_error() -> None:
    req = httpx.Request("POST", "https://api.groq.com")
    resp = httpx.Response(status_code=401, request=req)
    exc = httpx.HTTPStatusError("Unauthorized invalid api key", request=req, response=resp)

    classified = classify_error(exc)
    assert classified.category == ErrorCategory.AUTHENTICATION_ERROR
    assert classified.should_failover is True
    assert classified.is_retryable_on_same_provider is False


def test_classify_model_not_found() -> None:
    req = httpx.Request("POST", "https://api.groq.com")
    resp = httpx.Response(status_code=404, request=req)
    exc = httpx.HTTPStatusError("model not found", request=req, response=resp)

    classified = classify_error(exc)
    assert classified.category == ErrorCategory.MODEL_UNAVAILABLE
    assert classified.should_failover is True


def test_classify_safety_refusal() -> None:
    exc = ValueError("Response blocked by safety policy and content moderation")
    classified = classify_error(exc)
    assert classified.category == ErrorCategory.SAFETY_REFUSAL
    assert classified.should_failover is False

