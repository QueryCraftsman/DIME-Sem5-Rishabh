import asyncio
from backend.core.database import async_session_factory
from backend.models.analysis import Analysis
from sqlalchemy import select

async def main():
    async with async_session_factory() as session:
        res = await session.execute(select(Analysis).order_by(Analysis.created_at.desc()).limit(1))
        a = res.scalar()
        if a:
            print(f"ID: {a.id}")
            print(f"Status: {a.status}")
            print(f"Error: {a.error_message}")
            print(f"Stage: {a.current_stage}")
        else:
            print("No analyses found")

if __name__ == "__main__":
    asyncio.run(main())
