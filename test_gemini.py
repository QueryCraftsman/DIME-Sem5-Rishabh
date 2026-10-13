import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
os.environ["LLM_PROVIDER_NAME"] = "gemini"
os.environ["LLM_MODEL_NAME"] = "gemini-1.5-flash-latest"

from backend.agents.provider import LLMProvider
from langchain_core.messages import HumanMessage

async def main():
    try:
        provider = LLMProvider()
        res = await provider.generate([HumanMessage(content="Hello")])
        print("Success:", res.content)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
