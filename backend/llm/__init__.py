"""
DIME Centralized LLM Architecture Package.
"""

from backend.llm.config import LLMProviderType, Capability, ProviderConfig
from backend.llm.error_classifier import ErrorCategory, ClassifiedError, classify_error
from backend.llm.circuit_breaker import CircuitState, CircuitBreakerManager, circuit_breaker
from backend.llm.rate_limit_manager import RateLimitManager, rate_limit_manager
from backend.llm.response_validator import ResponseValidator, InvalidLLMOutputError
from backend.llm.telemetry import LLMAttemptLog, LLMMetricsRegistry, llm_metrics, log_attempt
from backend.llm.provider_interface import BaseLLMProvider
from backend.llm.provider_registry import ProviderRegistry, provider_registry
from backend.llm.provider_router import LLMRouter, AllProvidersExhaustedError, get_llm_router

__all__ = [
    "LLMProviderType",
    "Capability",
    "ProviderConfig",
    "ErrorCategory",
    "ClassifiedError",
    "classify_error",
    "CircuitState",
    "CircuitBreakerManager",
    "circuit_breaker",
    "RateLimitManager",
    "rate_limit_manager",
    "ResponseValidator",
    "InvalidLLMOutputError",
    "LLMAttemptLog",
    "LLMMetricsRegistry",
    "llm_metrics",
    "log_attempt",
    "BaseLLMProvider",
    "ProviderRegistry",
    "provider_registry",
    "LLMRouter",
    "AllProvidersExhaustedError",
    "get_llm_router",
]

