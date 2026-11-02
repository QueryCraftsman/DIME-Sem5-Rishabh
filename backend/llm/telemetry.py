"""
DIME Centralized LLM Architecture — Telemetry, Logging & Metrics (Phase 10).
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any

from backend.llm.error_classifier import ErrorCategory

logger = logging.getLogger("dime.llm.router")


@dataclass
class LLMAttemptLog:
    """Structured record of an individual LLM execution attempt."""
    request_id: str
    agent_name: str
    operation_name: str
    provider: str
    model: str
    attempt_number: int
    analysis_id: str | None = None
    task_id: str | None = None
    failure_category: ErrorCategory | None = None
    http_status: int | None = None
    latency_ms: float = 0.0
    fallback_triggered: bool = False
    selected_provider: str | None = None
    final_status: str = "pending"  # "success", "failed", "fallback"
    error_message: str | None = None


def log_attempt(attempt: LLMAttemptLog) -> None:
    """
    Emits structured, sanitized logs for an LLM request attempt.
    Guarantees that credentials, tokens, and authorization headers are NEVER logged.
    """
    log_dict = {
        "event": "llm_request_attempt",
        "request_id": attempt.request_id,
        "analysis_id": attempt.analysis_id or "N/A",
        "task_id": attempt.task_id or "N/A",
        "agent_name": attempt.agent_name,
        "operation_name": attempt.operation_name,
        "provider": attempt.provider,
        "model": attempt.model,
        "attempt_number": attempt.attempt_number,
        "latency_ms": round(attempt.latency_ms, 2),
        "fallback_triggered": attempt.fallback_triggered,
        "selected_provider": attempt.selected_provider,
        "final_status": attempt.final_status,
    }

    if attempt.http_status:
        log_dict["http_status"] = attempt.http_status
    if attempt.failure_category:
        log_dict["failure_category"] = attempt.failure_category.value
    if attempt.error_message:
        # Sanitize error message to prevent accidental key exposure
        clean_msg = attempt.error_message[:200]
        for key_pattern in ("key", "bearer", "token", "auth"):
            if key_pattern in clean_msg.lower():
                clean_msg = "[Sanitized Error Details]"
        log_dict["error_summary"] = clean_msg

    if attempt.final_status == "success":
        logger.info(
            f"[LLM] agent={attempt.agent_name} provider={attempt.provider} model={attempt.model} status=success latency_ms={round(attempt.latency_ms, 1)}",
            extra=log_dict
        )
    elif attempt.fallback_triggered:
        logger.warning(
            f"[LLM] Switching provider: {attempt.provider} -> {attempt.selected_provider or 'next'} (cause: {attempt.failure_category})",
            extra=log_dict
        )
    else:
        logger.warning(
            f"[LLM] Provider attempt failed: provider={attempt.provider} error={attempt.failure_category}",
            extra=log_dict
        )


class LLMMetricsRegistry:
    """In-memory telemetry counters and metrics accumulator."""

    def __init__(self) -> None:
        self.requests_total: dict[str, int] = {}
        self.requests_success: dict[str, int] = {}
        self.requests_failed: dict[str, int] = {}
        self.rate_limit_counts: dict[str, int] = {}
        self.server_error_counts: dict[str, int] = {}
        self.timeout_counts: dict[str, int] = {}
        self.fallback_total: int = 0
        self.latencies_ms: dict[str, list[float]] = {}
        self.last_success_time: dict[str, float] = {}
        self.last_failure_reason: dict[str, str] = {}

    def record_attempt(self, attempt: LLMAttemptLog) -> None:
        p = attempt.provider
        self.requests_total[p] = self.requests_total.get(p, 0) + 1
        self.latencies_ms.setdefault(p, []).append(attempt.latency_ms)
        if len(self.latencies_ms[p]) > 50:
            self.latencies_ms[p].pop(0)

        if attempt.final_status == "success":
            self.requests_success[p] = self.requests_success.get(p, 0) + 1
            self.last_success_time[p] = time.time()
        else:
            self.requests_failed[p] = self.requests_failed.get(p, 0) + 1
            if attempt.failure_category:
                self.last_failure_reason[p] = attempt.failure_category.value
                if attempt.failure_category == ErrorCategory.RATE_LIMITED:
                    self.rate_limit_counts[p] = self.rate_limit_counts.get(p, 0) + 1
                elif attempt.failure_category in (ErrorCategory.SERVER_ERROR, ErrorCategory.SERVICE_UNAVAILABLE):
                    self.server_error_counts[p] = self.server_error_counts.get(p, 0) + 1
                elif attempt.failure_category == ErrorCategory.TIMEOUT:
                    self.timeout_counts[p] = self.timeout_counts.get(p, 0) + 1

        if attempt.fallback_triggered:
            self.fallback_total += 1

    def get_summary(self) -> dict[str, Any]:
        """Returns non-sensitive health and performance metrics."""
        summary: dict[str, Any] = {
            "fallback_events_total": self.fallback_total,
            "providers": {},
        }
        for p, total in self.requests_total.items():
            success = self.requests_success.get(p, 0)
            failed = self.requests_failed.get(p, 0)
            rate = round((success / total * 100), 1) if total > 0 else 0.0
            lats = self.latencies_ms.get(p, [])
            avg_lat = round(sum(lats) / len(lats), 1) if lats else 0.0

            summary["providers"][p] = {
                "total_requests": total,
                "successful_requests": success,
                "failed_requests": failed,
                "success_rate_pct": rate,
                "mean_latency_ms": avg_lat,
                "rate_limits_429": self.rate_limit_counts.get(p, 0),
                "server_errors_5xx": self.server_error_counts.get(p, 0),
                "timeouts": self.timeout_counts.get(p, 0),
                "last_failure_reason": self.last_failure_reason.get(p, "none"),
                "seconds_since_last_success": round(time.time() - self.last_success_time[p], 1) if p in self.last_success_time else None,
            }
        return summary


# Global singleton metrics collector
llm_metrics = LLMMetricsRegistry()

