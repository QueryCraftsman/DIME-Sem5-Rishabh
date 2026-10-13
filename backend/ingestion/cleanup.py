"""
Cache expiration and cleanup logic for the Document Intelligence Pipeline.
"""

import datetime
import logging

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.evidence import SourceDocument

logger = logging.getLogger(__name__)


async def cleanup_expired_intelligence(session: AsyncSession, batch_size: int = 1000) -> int:
    """
    Deletes expired SourceDocuments in bounded batches.
    Returns the number of deleted records.
    
    Since PostgreSQL does not support DELETE ... LIMIT directly,
    we use a subquery to select the IDs first.
    """
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        
        # 1. Select a batch of expired IDs
        select_stmt = select(SourceDocument.id).where(
            SourceDocument.expires_at < now
        ).limit(batch_size)
        
        result = await session.execute(select_stmt)
        expired_ids = [row[0] for row in result.fetchall()]
        
        if not expired_ids:
            return 0
            
        # 2. Delete Qdrant vectors first
        try:
            from backend.worker.tasks import get_qdrant_store
            qdrant = get_qdrant_store()
            for doc_id in expired_ids:
                await qdrant.delete_by_document(str(doc_id))
        except Exception as q_err:
            logger.error(f"Failed to delete Qdrant vectors during cleanup: {q_err}")
            raise
            
        # 3. Delete those IDs from PostgreSQL
        delete_stmt = delete(SourceDocument).where(
            SourceDocument.id.in_(expired_ids)
        )
        
        res = await session.execute(delete_stmt)
        deleted_count = len(expired_ids)
        
        await session.commit()
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} expired intelligence records.")
            
        return deleted_count

    except Exception as e:
        await session.rollback()
        logger.exception(f"Error during expired intelligence cleanup: {e}")
        return 0
