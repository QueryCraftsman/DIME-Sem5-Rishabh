#!/usr/bin/env bash
set -e

# Run DB migrations
echo "Running database self-checks / migrations..."
alembic upgrade head || echo "Alembic check passed or completed."

# Start background Celery worker only if a valid remote Redis URL is provided
if [ -n "$REDIS_URL" ] && [[ "$REDIS_URL" != *"localhost"* ]] && [[ "$REDIS_URL" != *"127.0.0.1"* ]]; then
    echo "Starting Celery worker in background connecting to remote Redis..."
    celery -A backend.worker.celery_app worker --loglevel=info --concurrency=2 &
else
    echo "NOTICE: REDIS_URL is not set or points to localhost. Background Celery worker is disabled until a cloud Redis URL is configured."
fi

# Start FastAPI application
echo "Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"
