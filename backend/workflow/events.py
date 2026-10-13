import json
import logging
from typing import Any

from backend.core.cache import get_redis_client
from backend.models.analysis import AnalysisStatus

logger = logging.getLogger(__name__)


class ProgressPublisher:
    """Publishes progress events to Redis Pub/Sub for SSE streaming."""

    def __init__(self, analysis_id: str) -> None:
        self.analysis_id = analysis_id
        self.channel = f"analysis:events:{self.analysis_id}"

    async def publish(
        self,
        status: AnalysisStatus | str,
        stage: str,
        progress: int,
        error: str | None = None,
    ) -> None:
        """
        Publish an analysis_status progress event.
        """
        redis = await get_redis_client()
        
        status_str = status.value if isinstance(status, AnalysisStatus) else status
        
        payload: dict[str, Any] = {
            "type": "analysis_status",
            "analysis_id": self.analysis_id,
            "status": status_str,
            "stage": stage,
            "progress": progress,
        }
        if error is not None:
            payload["error"] = error
            
        try:
            await redis.publish(self.channel, json.dumps(payload))
            logger.info(
                "Published progress event",
                extra={
                    "analysis_id": self.analysis_id,
                    "stage": stage,
                    "progress": progress,
                    "status": status_str,
                },
            )
        except Exception as e:
            logger.error(
                f"Failed to publish progress event: {e}",
                extra={"analysis_id": self.analysis_id},
                exc_info=True,
            )

    async def publish_agent_activity(
        self,
        agent_name: str,
        action: str,
        status: str = "completed",
        details: dict[str, Any] | None = None,
    ) -> None:
        """Publish an agent_activity event via SSE and persist to DB."""
        from backend.core.database import async_session_factory
        from backend.models.analysis import AgentActivity

        redis = await get_redis_client()

        # Persist to DB
        activity_id = None
        try:
            async with async_session_factory() as session:
                activity = AgentActivity(
                    analysis_id=self.analysis_id,
                    agent_name=agent_name,
                    action=action,
                    details=json.dumps(details) if details else None,
                    status=status,
                )
                session.add(activity)
                await session.commit()
                await session.refresh(activity)
                activity_id = activity.id
                timestamp = activity.created_at.isoformat()
        except Exception as e:
            logger.error(f"Failed to persist agent activity: {e}")
            activity_id = "unknown"
            timestamp = ""

        # Publish to SSE
        payload = {
            "type": "agent_activity",
            "data": {
                "id": activity_id,
                "agent_name": agent_name,
                "action": action,
                "details": details,
                "status": status,
                "timestamp": timestamp,
            },
        }
        try:
            await redis.publish(self.channel, json.dumps(payload))
        except Exception as e:
            logger.error(f"Failed to publish agent activity event: {e}")

    async def publish_source_status(
        self,
        source_name: str,
        status: str,
        records_found: int = 0,
        records_indexed: int = 0,
        error: str | None = None,
        candidates_found: int = 0,
        relevant_count: int = 0,
        selected_count: int = 0,
        indexed_count: int = 0,
        duration_ms: float = 0.0,
    ) -> None:
        """Publish a source_ingestion event via SSE and persist to DB."""
        from backend.core.database import async_session_factory
        from backend.models.analysis import SourceIngestion

        redis = await get_redis_client()

        # Use the new pipeline metrics if provided, otherwise fall back to legacy
        actual_found = records_found or candidates_found
        actual_indexed = records_indexed or indexed_count or selected_count

        details: dict[str, Any] = {
            "records_found": actual_found,
            "records_indexed": actual_indexed,
            # Pipeline funnel metrics
            "candidates_found": candidates_found,
            "relevant_count": relevant_count,
            "selected_count": selected_count,
            "indexed_count": indexed_count,
            "duration_ms": round(duration_ms, 1),
        }
        if error:
            details["error"] = error

        # Persist to DB
        ingestion_id = None
        try:
            async with async_session_factory() as session:
                ingestion = SourceIngestion(
                    analysis_id=self.analysis_id,
                    source_name=source_name,
                    status=status,
                    records_found=actual_found,
                    records_indexed=actual_indexed,
                    error_message=error,
                )
                session.add(ingestion)
                await session.commit()
                await session.refresh(ingestion)
                ingestion_id = ingestion.id
        except Exception as e:
            logger.error(f"Failed to persist source ingestion: {e}")
            ingestion_id = "unknown"

        # Publish to SSE
        payload = {
            "type": "source_ingestion",
            "data": {
                "id": ingestion_id,
                "source_name": source_name,
                "status": status,
                "records_found": actual_found,
                "records_indexed": actual_indexed,
                "candidates_found": candidates_found,
                "relevant_count": relevant_count,
                "selected_count": selected_count,
                "indexed_count": indexed_count,
                "duration_ms": round(duration_ms, 1),
                "error": error,
            },
        }
        try:
            await redis.publish(self.channel, json.dumps(payload))
        except Exception as e:
            logger.error(f"Failed to publish source ingestion event: {e}")
