"""
DIME Centralized LLM Architecture — Centralized Error Classifier (Phase 6).
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass
from enum import Enum
from typing import Any


class ErrorCategory(str, Enum):
    """Normalized LLM error classifications."""
    RATE_LIMITED = "rate_limited"           # HTTP 429
    SERVICE_UNAVAILABLE = "service_unavailable" # HTTP 503
    SERVER_ERROR = "server_error"           # HTTP 500, 502, 504
    TIMEOUT = "timeout"                     # Network / Request timeout
    NETWORK_ERROR = "network_error"         # Socket / Connection failure
    AUTHENTICATION_ERROR = "auth_error"     # HTTP 401, 403, invalid key
    MODEL_UNAVAILABLE = "model_unavailable" # HTTP 404, model not found
    INVALID_REQUEST = "invalid_request"     # HTTP 400
    CONTEXT_LIMIT = "context_limit"         # Token context overflow
    INVALID_OUTPUT = "invalid_output"       # Schema validation failure / bad JSON
    SAFETY_REFUSAL = "safety_refusal"       # Content moderation refusal
    UNKNOWN = "unknown"


@dataclass
class ClassifiedError:
    """Normalized diagnostic error record."""
    category: ErrorCategory
    status_code: int | None
    message: str
    is_retryable_on_same_provider: bool
    should_failover: bool
    retry_after_seconds: float | None
    original_error: Exception | None = None


def classify_error(exc: Exception) -> ClassifiedError:
    """
    Classifies any exception raised during LLM interaction into a standard ClassifiedError.
    Extracts HTTP status codes, Retry-After headers, and provider-specific error patterns.
    """
    err_str = str(exc).lower()
    status_code: int | None = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    retry_after: float | None = None

    # Try to extract status code if embedded in exception response or args
    response = getattr(exc, "response", None)
    if response is not None:
        if status_code is None and hasattr(response, "status_code"):
            status_code = response.status_code
        
        # Check Retry-After header
        headers = getattr(response, "headers", {})
        if headers:
            retry_val = headers.get("retry-after") or headers.get("Retry-After")
            if retry_val:
                try:
                    retry_after = float(retry_val)
                except (ValueError, TypeError):
                    pass

    # 1. Rate Limiting (HTTP 429)
    if status_code == 429 or any(k in err_str for k in ("429", "rate limit", "rate_limit", "resource_exhausted", "quota", "too many requests")):
        # If retry_after not found in headers, check error message for seconds
        if retry_after is None:
            match = re.search(r"try again in ([0-9]+(?:\.[0-9]+)?)\s*s", err_str)
            if match:
                retry_after = float(match.group(1))
            else:
                retry_after = 60.0  # default 60s cooldown

        return ClassifiedError(
            category=ErrorCategory.RATE_LIMITED,
            status_code=429,
            message="Provider rate limit exceeded or quota exhausted.",
            is_retryable_on_same_provider=False,
            should_failover=True,
            retry_after_seconds=retry_after,
            original_error=exc,
        )

    # 2. Service Unavailable (HTTP 503)
    if status_code == 503 or any(k in err_str for k in ("503", "service unavailable", "overloaded", "high demand")):
        return ClassifiedError(
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            status_code=503,
            message="Provider service is temporarily overloaded or unavailable.",
            is_retryable_on_same_provider=True,
            should_failover=True,
            retry_after_seconds=5.0,
            original_error=exc,
        )

    # 3. Server Errors (500, 502, 504)
    if status_code in (500, 502, 504) or any(k in err_str for k in ("500", "502", "504", "internal server error", "bad gateway", "gateway timeout")):
        return ClassifiedError(
            category=ErrorCategory.SERVER_ERROR,
            status_code=status_code or 500,
            message="Provider returned a transient server error.",
            is_retryable_on_same_provider=True,
            should_failover=True,
            retry_after_seconds=2.0,
            original_error=exc,
        )

    # 4. Timeout
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)) or any(k in err_str for k in ("timeout", "timed out", "deadline exceeded")):
        return ClassifiedError(
            category=ErrorCategory.TIMEOUT,
            status_code=408,
            message="Request to provider timed out.",
            is_retryable_on_same_provider=True,
            should_failover=True,
            retry_after_seconds=2.0,
            original_error=exc,
        )

    # 5. Network / Connection Error
    if any(k in err_str for k in ("connection reset", "connection refused", "connecterror", "network error", "remotedisconnected", "failed to establish")):
        return ClassifiedError(
            category=ErrorCategory.NETWORK_ERROR,
            status_code=None,
            message="Failed to establish network connection with provider.",
            is_retryable_on_same_provider=False,
            should_failover=True,
            retry_after_seconds=3.0,
            original_error=exc,
        )

    # 6. Authentication Error (401, 403)
    if status_code in (401, 403) or any(k in err_str for k in ("401", "403", "unauthorized", "forbidden", "invalid api key", "api_key_invalid", "permission denied")):
        return ClassifiedError(
            category=ErrorCategory.AUTHENTICATION_ERROR,
            status_code=status_code or 401,
            message="Authentication failure: Invalid or expired API key.",
            is_retryable_on_same_provider=False,
            should_failover=True,
            retry_after_seconds=None,
            original_error=exc,
        )

    # 7. Model Unavailable (404)
    if status_code == 404 or any(k in err_str for k in ("404", "model not found", "model_not_found", "does not exist")):
        return ClassifiedError(
            category=ErrorCategory.MODEL_UNAVAILABLE,
            status_code=404,
            message="Configured model identifier does not exist or is deprecated on provider.",
            is_retryable_on_same_provider=False,
            should_failover=True,
            retry_after_seconds=None,
            original_error=exc,
        )

    # 8. Context Window Limit Exceeded
    if any(k in err_str for k in ("context length", "maximum context", "token limit", "tokens exceeded", "prompt is too long")):
        return ClassifiedError(
            category=ErrorCategory.CONTEXT_LIMIT,
            status_code=400,
            message="Input exceeds provider model context window.",
            is_retryable_on_same_provider=False,
            should_failover=True,
            retry_after_seconds=None,
            original_error=exc,
        )

    # 9. Safety / Content Refusal
    if any(k in err_str for k in ("safety", "blocked by safety policy", "content moderation", "refusal")):
        return ClassifiedError(
            category=ErrorCategory.SAFETY_REFUSAL,
            status_code=400,
            message="Request refused by provider safety guidelines.",
            is_retryable_on_same_provider=False,
            should_failover=False,  # Do not bypass safety by switching providers
            retry_after_seconds=None,
            original_error=exc,
        )

    # 10. Invalid Output / Parsing Failure
    if any(k in err_str for k in ("validation error", "jsondecodeerror", "invalid json", "schema validation")):
        return ClassifiedError(
            category=ErrorCategory.INVALID_OUTPUT,
            status_code=None,
            message="Provider returned invalid JSON or response failed schema validation.",
            is_retryable_on_same_provider=True,
            should_failover=True,
            retry_after_seconds=1.0,
            original_error=exc,
        )

    # 11. Generic Invalid Request (400)
    if status_code == 400 or "bad request" in err_str:
        return ClassifiedError(
            category=ErrorCategory.INVALID_REQUEST,
            status_code=400,
            message="Bad request parameters supplied to provider.",
            is_retryable_on_same_provider=False,
            should_failover=False,  # Invalid request should not blindly hit all providers
            retry_after_seconds=None,
            original_error=exc,
        )

    # Fallback: Unknown Error
    return ClassifiedError(
        category=ErrorCategory.UNKNOWN,
        status_code=status_code,
        message=f"Unhandled provider error: {exc}",
        is_retryable_on_same_provider=True,
        should_failover=True,
        retry_after_seconds=2.0,
        original_error=exc,
    )

