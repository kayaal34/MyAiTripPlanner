import httpx
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={key}"

payload = {
    "contents": [{"parts": [{"text": "Return JSON: {\"greeting\": \"hello\"}"}]}],
    "generationConfig": {
        "response_mime_type": "application/json",
        "maxOutputTokens": 50,
    },
}

r = httpx.post(url, json=payload, timeout=30)
print(f"Status: {r.status_code}")
print(r.text[:500])
