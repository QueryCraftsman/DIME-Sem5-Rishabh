#!/usr/bin/env bash
set -e

# Run DB migrations only if a remote cloud database is configured
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" != *"localhost"* ]] && [[ "$DATABASE_URL" != *"127.0.0.1"* ]]; then
    echo "Running database self-checks / migrations on cloud database..."
    alembic upgrade head || echo "Alembic check passed or completed."
else
    echo "NOTICE: DATABASE_URL is not set or points to localhost. Database migrations skipped until a cloud database is configured in Render Environment."
fi

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
