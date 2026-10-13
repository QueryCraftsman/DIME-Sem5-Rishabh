import os
import requests
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.environ.get("GROQ_API_KEY")

r = requests.get(
    "https://api.groq.com/openai/v1/models",
    headers={"Authorization": f"Bearer {api_key}"}
)
try:
    models = r.json().get("data", [])
    for m in models:
        print(m.get("id"))
except Exception as e:
    print("Error:", e, r.text)
