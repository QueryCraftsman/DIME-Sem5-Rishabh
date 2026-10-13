import asyncio
import os
import sys

from uuid import uuid4
from backend.core.database import async_session_factory
from backend.models.analysis import Analysis, AnalysisStatus
from backend.worker.tasks import _run_analysis_pipeline_async

async def main():
    async with async_session_factory() as session:
        analysis_id = str(uuid4())
        idea_id = "test-idea-123"
        
        print(f"Creating Analysis {analysis_id} for idea {idea_id}")
        
        analysis = Analysis(
            id=analysis_id,
            user_id="anonymous",
            idea_id=idea_id,
            title="Test Idea",
            description="A revolutionary platform for testing AI pipelines.",
            status=AnalysisStatus.PENDING
        )
        
        session.add(analysis)
        await session.commit()
        
    print("Running pipeline...")
    import uuid
    await _run_analysis_pipeline_async(uuid.UUID(analysis_id))
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
