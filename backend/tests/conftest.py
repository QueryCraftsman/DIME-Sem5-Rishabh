import pytest
import pytest_asyncio
from typing import AsyncGenerator, Any

try:
    import aiosqlite
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from backend.core.database import Base
    from backend.core.config import get_settings

    settings = get_settings()
    TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    TestingSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
except ImportError:
    aiosqlite = None
    engine = None
    TestingSessionLocal = None
    Base = None


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[Any, None]:
    """Provides a fresh database session for a test."""
    if engine is not None and TestingSessionLocal is not None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with TestingSessionLocal() as session:
            yield session
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    else:
        # Fallback to application's async PostgreSQL session with NullPool to avoid event-loop cross-contamination
        from sqlalchemy.pool import NullPool
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
        from backend.core.config import get_settings

        test_pg_engine = create_async_engine(get_settings().database_url, poolclass=NullPool)
        test_session_factory = async_sessionmaker(
            bind=test_pg_engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        async with test_session_factory() as session:
            yield session
            await session.rollback()
        await test_pg_engine.dispose()
