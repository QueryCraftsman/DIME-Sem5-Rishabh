import asyncio
from backend.core.database import async_session_factory
from backend.api.v1.comparisons import list_comparisons

async def main():
    async with async_session_factory() as s:
        try:
            res = await list_comparisons(db=s)
            print("Success! Reports count:", len(res["reports"]))
            print("Statistics:", res["statistics"])
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
