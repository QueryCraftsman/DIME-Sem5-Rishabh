import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from backend.main import app
from backend.models.analysis import Analysis, AnalysisStatus
from backend.core.database import get_db


@pytest.mark.asyncio
async def test_sse_initial_state_completed() -> None:
    """Test SSE endpoint immediately closes if analysis is already completed."""
    
    mock_analysis = Analysis(
        id="test-analysis",
        title="Test",
        description="Desc",
        target_audience="Devs",
        domain="Tech",
        user_id="anonymous",
        idea_id="idea-1",
        status=AnalysisStatus.COMPLETED,
        current_stage="COMPLETED",
        progress=100
    )
    
    mock_session = AsyncMock()
    mock_session.get.return_value = mock_analysis
    
    app.dependency_overrides[get_db] = lambda: mock_session

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/analyses/test-analysis/events")
        
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        
        # The content should be just the initial payload and then close
        content = response.content.decode("utf-8")
        assert "data: {" in content
        assert '"status": "completed"' in content
        assert '"progress": 100' in content
        
    app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("backend.api.v1.analyses.get_redis_client")
async def test_sse_streaming_events(mock_get_redis: MagicMock) -> None:
    """Test SSE endpoint subscribes and streams events from Redis."""
    
    mock_analysis = Analysis(
        id="test-analysis",
        title="Test",
        description="Desc",
        target_audience="Devs",
        domain="Tech",
        user_id="anonymous",
        idea_id="idea-1",
        status=AnalysisStatus.RUNNING,
        current_stage="ACQUIRING",
        progress=20
    )
    
    mock_session = AsyncMock()
    mock_session.get.return_value = mock_analysis
    
    app.dependency_overrides[get_db] = lambda: mock_session

    # Mock Redis pubsub
    mock_redis = AsyncMock()
    mock_pubsub = AsyncMock()
    mock_redis.pubsub = MagicMock(return_value=mock_pubsub)
    mock_get_redis.return_value = mock_redis
    
    # Simulate receiving a COMPLETED event from Redis
    event_payload = json.dumps({
        "analysis_id": "test-analysis",
        "status": AnalysisStatus.COMPLETED.value,
        "stage": "COMPLETED",
        "progress": 100
    })
    
    # get_message will return this message once, then None, then we exit loop because COMPLETED
    mock_pubsub.get_message.side_effect = [
        {"type": "message", "data": event_payload.encode("utf-8")}
    ]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/analyses/test-analysis/events")
        
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        
        content = response.content.decode("utf-8")
        
        # Should have the initial state (ACQUIRING)
        assert '"progress": 20' in content
        
        # Should have the streamed state (COMPLETED)
        assert '"progress": 100' in content
        
        # Should have subscribed to the channel
        mock_pubsub.subscribe.assert_called_with("analysis:events:test-analysis")
        
        # Should have cleaned up
        mock_pubsub.unsubscribe.assert_called_with("analysis:events:test-analysis")
        mock_pubsub.close.assert_called()

    app.dependency_overrides.clear()
