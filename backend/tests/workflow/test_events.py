import json
from unittest.mock import AsyncMock, patch

import pytest

from backend.models.analysis import AnalysisStatus
from backend.workflow.events import ProgressPublisher


@pytest.mark.asyncio
async def test_progress_publisher() -> None:
    """Test that ProgressPublisher publishes correctly formatted JSON to Redis."""
    analysis_id = "test-analysis-123"
    publisher = ProgressPublisher(analysis_id)

    mock_redis = AsyncMock()
    
    with patch("backend.workflow.events.get_redis_client", return_value=mock_redis):
        await publisher.publish(
            status=AnalysisStatus.RUNNING,
            stage="PROCESSING",
            progress=50,
            error=None
        )
        
        # Verify publish was called
        mock_redis.publish.assert_called_once()
        args, kwargs = mock_redis.publish.call_args
        
        assert args[0] == f"analysis:events:{analysis_id}"
        
        payload = json.loads(args[1])
        assert payload["analysis_id"] == analysis_id
        assert payload["status"] == "running"
        assert payload["stage"] == "PROCESSING"
        assert payload["progress"] == 50
        assert "error" not in payload


@pytest.mark.asyncio
async def test_progress_publisher_with_error() -> None:
    """Test that ProgressPublisher includes error when provided."""
    analysis_id = "test-analysis-123"
    publisher = ProgressPublisher(analysis_id)

    mock_redis = AsyncMock()
    
    with patch("backend.workflow.events.get_redis_client", return_value=mock_redis):
        await publisher.publish(
            status=AnalysisStatus.FAILED,
            stage="ACQUIRING",
            progress=20,
            error="API rate limit exceeded"
        )
        
        mock_redis.publish.assert_called_once()
        args, _ = mock_redis.publish.call_args
        
        payload = json.loads(args[1])
        assert payload["status"] == "failed"
        assert payload["error"] == "API rate limit exceeded"
