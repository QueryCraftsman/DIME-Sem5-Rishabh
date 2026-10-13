import asyncio
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
os.environ["LLM_PROVIDER_NAME"] = "groq"
os.environ["LLM_MODEL_NAME"] = "llama3-8b-8192"

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
