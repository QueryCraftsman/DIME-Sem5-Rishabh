import datetime
import pytest

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select

from backend.ingestion.cleanup import cleanup_expired_intelligence
from backend.models.evidence import SourceDocument

from unittest.mock import patch, AsyncMock

from sqlalchemy.ext.asyncio import AsyncSession

@pytest.mark.asyncio
@patch("backend.worker.tasks.get_qdrant_store")
async def test_cleanup_expired_intelligence(mock_get_qdrant: AsyncMock, db_session: AsyncSession) -> None:
    mock_qdrant_instance = mock_get_qdrant.return_value
    mock_qdrant_instance.delete_by_document = AsyncMock(return_value=None)
    
    now = datetime.datetime.now(datetime.timezone.utc)
    past = now - datetime.timedelta(days=1)
    future = now + datetime.timedelta(days=1)
    
    # Insert 1 expired, 1 valid document
    stmt1 = insert(SourceDocument).values(
        source="test",
        source_id="expired_1",
        source_type="test",
        title="Expired",
        retrieved_at=past,
        expires_at=past
    )
    stmt2 = insert(SourceDocument).values(
        source="test",
        source_id="valid_1",
        source_type="test",
        title="Valid",
        retrieved_at=now,
        expires_at=future
    )
    
    await db_session.execute(stmt1)
    await db_session.execute(stmt2)
    await db_session.commit()
    
    # Run cleanup
    count = await cleanup_expired_intelligence(db_session)
    assert count == 1
    
    # Verify DB
    result = await db_session.execute(select(SourceDocument.source_id))
    remaining = result.scalars().all()
    assert len(remaining) == 1
    assert remaining[0] == "valid_1"
