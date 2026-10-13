import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from backend.core.config import get_settings
from backend.core.database import Base
from backend.models.analysis import Analysis
from backend.models.evidence import SourceDocument, SourceChunk, Evidence, Finding

settings = get_settings()

# Use an in-memory SQLite database for testing, using aiosqlite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

from typing import AsyncGenerator, Any

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides a fresh database session for a test."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestingSessionLocal() as session:
        yield session
        
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
