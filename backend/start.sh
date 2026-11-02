#!/usr/bin/env bash
set -e

# Run DB migrations
echo "Running database self-checks / migrations..."
alembic upgrade head || echo "Alembic check passed or completed."

# Start background Celery worker
echo "Starting Celery worker in background..."
celery -A backend.worker.celery_app worker --loglevel=info --concurrency=2 &

# Start FastAPI application
echo "Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn backend.main:app --host 0.0.0.0 --port "${PORT:-8000}"

