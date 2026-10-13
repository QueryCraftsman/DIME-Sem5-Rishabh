"""
DIME Backend — Exception hierarchy.

Provides structured error types for consistent API error responses.
"""

from __future__ import annotations

from typing import Any


class DimeError(Exception):
    """Base exception for all DIME application errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        *,
        status_code: int = 500,
        detail: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail or {}


class NotFoundError(DimeError):
    """Resource not found."""

    def __init__(self, resource: str, identifier: str | None = None) -> None:
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} '{identifier}' not found"
        super().__init__(msg, status_code=404)


class ValidationError(DimeError):
    """Input validation failure."""

    def __init__(self, message: str = "Validation failed", **kwargs: Any) -> None:
        super().__init__(message, status_code=422, **kwargs)


class AuthenticationError(DimeError):
    """Authentication failure."""

    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message, status_code=401)


class AuthorizationError(DimeError):
    """Authorization failure."""

    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message, status_code=403)


class ExternalServiceError(DimeError):
    """External service failure (GitHub, Semantic Scholar, etc.)."""

    def __init__(self, service: str, message: str = "Service unavailable") -> None:
        super().__init__(
            f"{service}: {message}",
            status_code=502,
            detail={"service": service},
        )


class RateLimitError(DimeError):
    """Rate limit exceeded."""

    def __init__(self, service: str = "API") -> None:
        super().__init__(f"{service} rate limit exceeded", status_code=429)


class AnalysisError(DimeError):
    """Analysis pipeline failure."""

    def __init__(self, message: str = "Analysis failed", **kwargs: Any) -> None:
        super().__init__(message, status_code=500, **kwargs)
