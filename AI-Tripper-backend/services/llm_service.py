import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()


def _extract_json_object(text: str) -> dict[str, Any]:
    """Try strict JSON parse first, then recover from fenced or noisy output."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise json.JSONDecodeError("No JSON object found", cleaned, 0)

    return json.loads(cleaned[start : end + 1])


async def resolve_country_name_from_city(city: str) -> str:
    """Resolve country dynamically from city using geocoding first, then REST Countries fallback."""
    city_clean = city.split(",")[0].strip()
    if not city_clean:
        return ""

    timeout = httpx.Timeout(connect=10.0, read=10.0, write=10.0, pool=10.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            # Primary: Nominatim city lookup
            nominatim = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": city,
                    "format": "json",
                    "limit": 1,
                    "addressdetails": 1,
                },
                headers={"User-Agent": "AI-Trip-Planner/2.0"},
            )
            if nominatim.status_code == 200:
                rows = nominatim.json()
                if rows:
                    country = rows[0].get("address", {}).get("country", "").strip()
                    if country:
                        return country

            # Secondary: if user typed "City, Country"
            if "," in city:
                parts = [part.strip() for part in city.split(",") if part.strip()]
                if len(parts) >= 2:
                    return parts[-1]

            # Fallback: REST Countries by capital
            by_capital = await client.get(
                f"https://restcountries.com/v3.1/capital/{city_clean}",
                timeout=8.0,
            )
            if by_capital.status_code == 200:
                rows = by_capital.json()
                if rows:
                    return rows[0].get("name", {}).get("common", "").strip()
    except Exception as exc:
        print(f"Country resolve failed for city '{city}': {exc}")

    return ""


async def get_country_context(city: str) -> tuple[str, str]:
    """Return country context text + flag URL for prompt enrichment."""
    try:
        country_name = await resolve_country_name_from_city(city)
        if not country_name:
            return ("", "")

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://restcountries.com/v3.1/name/{country_name}?fullText=false"
            )

        if response.status_code != 200:
            return ("", "")

        rows = response.json()
        if not rows:
            return ("", "")

        country = rows[0]
        languages = ", ".join(list(country.get("languages", {}).values())[:3]) or "N/A"
        currencies = ", ".join(list(country.get("currencies", {}).keys())[:2]) or "N/A"
        timezone = country.get("timezones", ["N/A"])[0]
        flag_url = country.get("flags", {}).get("png", "")
        capital = country.get("capital", [""])[0]
        region = country.get("region", "")
        subregion = country.get("subregion", "")
        common_name = country.get("name", {}).get("common", country_name)

        context = (
            f"Country context for {common_name}:\\n"
            f"- Capital: {capital}\\n"
            f"- Languages: {languages}\\n"
            f"- Currency: {currencies}\\n"
            f"- Timezone: {timezone}\\n"
            f"- Region: {region} / {subregion}\\n"
            "Use this context to keep pricing, local tips, and emergency info realistic."
        )
        return (context, flag_url)
    except Exception as exc:
        print(f"Country context fetch failed: {exc}")
        return ("", "")


async def generate_detailed_trip_itinerary(trip_data: dict):
    """Generate a compact day-by-day itinerary as strict JSON using Gemini 2.5 Flash."""

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_API_KEY was not found. Check your .env file.",
        )

    city = trip_data.get("city", "Istanbul")
    days = int(trip_data.get("days", 3))
    travelers = trip_data.get("travelers", "yalniz")
    interests = trip_data.get("interests", [])
    budget = trip_data.get("budget", "orta")
    transport = trip_data.get("transport", "farketmez")
    start_date = trip_data.get("start_date", "")
    target_language = (trip_data.get("language") or "Turkish").strip() or "Turkish"

    country_context, country_flag = await get_country_context(city)

    interests_text = ", ".join(interests) if interests else "general tourism"

    traveler_guides = {
        "yalniz": "Solo traveler: prioritize safe public areas, flexible plans, social-friendly venues.",
        "cift": "Couple: include romantic views, date-friendly restaurants, and cozy evening ideas.",
        "aile": "Family: include child-friendly attractions, balanced pacing, and safety-first options.",
        "arkadaslar": "Friends: include social spots, group activities, and lively evening options.",
    }
    traveler_context = traveler_guides.get(travelers.lower(), traveler_guides["yalniz"])

    budget_guides = {
        "ekonomik": "budget-friendly",
        "orta": "mid-range",
        "luks": "premium",
    }
    budget_context = budget_guides.get(str(budget).lower(), "mid-range")

    prompt = f"""
You are an expert local travel planner.
Create a realistic {days}-day travel itinerary for {city}.

Hard requirements:
1) Return ONLY one valid JSON object.
2) Do NOT include markdown, code fences, backticks, comments, or explanation text.
3) Keep all user-facing itinerary content in {target_language}.
4) Keep place and restaurant names real and geographically plausible.
5) Include realistic addresses and coordinates whenever possible.
6) Keep costs and suggestions aligned with a {budget_context} budget.
7) Consider traveler type: {traveler_context}
8) Interests: {interests_text}
9) Preferred transport: {transport}
10) Start date (if present): {start_date or 'not provided'}
11) Keep each activity description short: maximum 12 words.

{country_context}

JSON schema to follow exactly (only these top-level keys):
{{
    "trip_summary": {{
        "destination": "string",
        "duration_days": {days},
        "travelers": "string",
        "total_estimated_cost": "string",
        "best_season": "string",
        "weather_forecast": "string"
    }},
    "daily_itinerary": [
        {{
            "day": 1,
            "date": "string",
            "title": "string",
            "activities": [
                {{
                    "time": "string",
                    "name": "string",
                    "type": "string",
                    "address": "string",
                    "coordinates": {{"lat": 0.0, "lng": 0.0}},
                    "duration": "string",
                    "cost": "string",
                    "description": "string"
                }}
            ],
            "estimated_daily_budget": "string",
            "transportation_note": "string"
        }}
    ]
}}
"""

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={api_key}"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.5,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 8192,
            "response_mime_type": "application/json",
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ],
    }

    timeout = httpx.Timeout(connect=30.0, read=120.0, write=30.0, pool=30.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers={"Content-Type": "application/json"}, json=payload)
    except httpx.ConnectTimeout:
        raise HTTPException(
            status_code=504,
            detail="Could not connect to Gemini API. Please try again.",
        )
    except httpx.ReadTimeout:
        raise HTTPException(
            status_code=504,
            detail="Gemini API timed out. Try fewer days and retry.",
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"Gemini request failed: {exc}")

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API error ({response.status_code}).",
        )

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise HTTPException(status_code=500, detail="Gemini returned no candidates.")

    try:
        ai_text = candidates[0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(status_code=500, detail="Gemini response shape is invalid.")

    try:
        itinerary = _extract_json_object(ai_text)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON. Please try again.",
        )

    if country_flag:
        itinerary["country_flag"] = country_flag

    return itinerary


async def generate_mock_trip_itinerary(trip_data: dict) -> dict[str, Any]:
    """Backup itinerary generator used when AI providers are unavailable."""

    city = trip_data.get("city", "Istanbul")
    days = int(trip_data.get("days", 3))
    travelers = trip_data.get("travelers", "yalniz")

    daily_itinerary = []
    for day in range(1, days + 1):
        daily_itinerary.append(
            {
                "day": day,
                "date": "",
                "title": f"Day {day} in {city}",
                "activities": [
                    {
                        "time": "09:00",
                        "name": "City Center Walk",
                        "type": "sightseeing",
                        "address": city,
                        "coordinates": {"lat": 0.0, "lng": 0.0},
                        "duration": "2h",
                        "cost": "N/A",
                        "description": "Explore central highlights.",
                    },
                    {
                        "time": "13:00",
                        "name": "Local Lunch",
                        "type": "food",
                        "address": city,
                        "coordinates": {"lat": 0.0, "lng": 0.0},
                        "duration": "1h",
                        "cost": "N/A",
                        "description": "Try popular local dishes.",
                    },
                    {
                        "time": "17:00",
                        "name": "Evening Landmark Visit",
                        "type": "attraction",
                        "address": city,
                        "coordinates": {"lat": 0.0, "lng": 0.0},
                        "duration": "2h",
                        "cost": "N/A",
                        "description": "Visit a signature spot.",
                    },
                ],
                "estimated_daily_budget": "N/A",
                "transportation_note": "Use local transit or walking.",
            }
        )

    return {
        "trip_summary": {
            "destination": city,
            "duration_days": days,
            "travelers": travelers,
            "total_estimated_cost": "N/A",
            "best_season": "N/A",
            "weather_forecast": "N/A",
        },
        "daily_itinerary": daily_itinerary,
    }
