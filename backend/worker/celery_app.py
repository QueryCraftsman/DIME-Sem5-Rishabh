"""
DIME Backend - Celery App Initialization.
"""

from celery import Celery

from backend.core.config import get_settings

settings = get_settings()

# Initialize Celery app
celery_app = Celery(
    "dime_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["backend.worker.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour limit for analysis
)
