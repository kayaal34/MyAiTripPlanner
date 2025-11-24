import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_places(city: str, interests: list, stop_count: int):
    prompt = f"""
    Create a JSON list of {stop_count} travel locations in {city}.
    Interests: {', '.join(interests)}.

    Format:
    {{
        "places": [
            {{
                "name": "string",
                "lat": number,
                "lng": number
            }}
        ]
    }}

    Output ONLY valid JSON.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You generate travel locations ONLY in JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content

    print("LLM RAW OUTPUT:", raw)  # KRİTİK LOG

    data = json.loads(raw)
    return data["places"]
