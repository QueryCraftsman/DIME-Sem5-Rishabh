import asyncio
from backend.core.database import async_session_factory
from sqlalchemy import text

async def check():
    async with async_session_factory() as session:
        users = (await session.execute(text('SELECT id, name, email FROM "User"'))).fetchall()
        print('USERS:', users)
        reports = (await session.execute(text('SELECT id, "userId", title FROM "ComparisonReport"'))).fetchall()
        print('REPORTS WITH USERID:', reports)

if __name__ == '__main__':
    asyncio.run(check())
