import asyncio
import json
import os
import re
from typing import Any
import random

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()


def _fix_json_string(s: str) -> str:
    """Fix common JSON issues: trailing commas, unescaped characters."""
    # Remove trailing commas before } or ]
    s = re.sub(r",\s*([}\]])", r"\1", s)
    return s


def _extract_json_object(text: str) -> dict[str, Any]:
    """Try strict JSON parse first, then recover from fenced or noisy output."""
    # 1) Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    cleaned = text.strip()

    # 2) Strip thinking blocks from Gemini 2.5 models
    cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL).strip()

    # 3) Remove markdown fences
    if cleaned.startswith("```"):
        # Extract content between fences
        fence_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", cleaned, re.DOTALL)
        if fence_match:
            cleaned = fence_match.group(1).strip()
        else:
            cleaned = cleaned.strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

    # 4) Find outermost JSON object
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise json.JSONDecodeError("No JSON object found", cleaned, 0)

    json_str = cleaned[start : end + 1]

    # 5) Try direct parse of extracted JSON
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    # 6) Try with common fixes (trailing commas, etc.)
    fixed = _fix_json_string(json_str)
    return json.loads(fixed)



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
            f"Country: {common_name}. Capital: {capital}. Languages: {languages}. "
            f"Currency: {currencies}. Timezone: {timezone}. Region: {region} / {subregion}."
        )
        return (context, flag_url)
    except Exception as exc:
        print(f"Country context fetch failed: {exc}")
        return ("", "")


def _get_api_keys() -> list:
    """Collect all available Gemini API keys (supports key rotation for rate limits)."""
    keys = []
    primary = os.getenv("GOOGLE_API_KEY", "").strip()
    if primary:
        keys.append(primary)
    for i in range(2, 6):
        extra = os.getenv(f"GOOGLE_API_KEY_{i}", "").strip()
        if extra:
            keys.append(extra)
    return keys


async def generate_detailed_trip_itinerary(trip_data: dict):
    """Generate a compact day-by-day itinerary as strict JSON using Gemini 2.5 Flash."""

    api_keys = _get_api_keys()
    if not api_keys:
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

    _, country_flag = await get_country_context(city)

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
Create a {days}-day travel itinerary for {city} in {target_language}.
Return only one JSON object.

Rules:
- Use real, geographically plausible places.
- Keep descriptions very short.
- Match a {budget_context} budget.
- Traveler type: {traveler_context}
- Interests: {interests_text}
- Transport: {transport}
- Start date: {start_date or 'not provided'}
- Keep the itinerary practical and concise.

JSON shape:
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

    # Retry delays: Attempt 0->1: 2s, 1->2: 4s, 2->3: 8s
    RATE_LIMIT_DELAYS = [2, 4, 8]
    MAX_ATTEMPTS = len(RATE_LIMIT_DELAYS) + 1  # 4 total

    timeout = httpx.Timeout(connect=30.0, read=120.0, write=30.0, pool=30.0)

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

    response = None
    last_error_detail = None
    key_index = 0

    for attempt in range(MAX_ATTEMPTS):
        # Rotate to next API key on each retry (if multiple keys available)
        current_key = api_keys[key_index % len(api_keys)]
        key_index += 1

        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.5-flash:generateContent?key={current_key}"
        )

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

        if response.status_code == 200:
            break

        response_text = response.text[:600]
        last_error_detail = f"Gemini API error ({response.status_code}): {response_text}"
        is_rate_limit = response.status_code in {429, 503}

        if is_rate_limit and attempt < MAX_ATTEMPTS - 1:
            wait_sec = RATE_LIMIT_DELAYS[attempt]
            key_hint = f" (deneniyor: anahtar {key_index % len(api_keys) + 1}/{len(api_keys)})" if len(api_keys) > 1 else ""
            print(f"⚠️ HATA KODU: {response.status_code}. ⏳ Yeniden deneniyor (deneme {attempt + 1}/{MAX_ATTEMPTS}). {wait_sec}s bekleniyor{key_hint}...")
            await asyncio.sleep(wait_sec)
            continue

        # Non-retryable error or exhausted retries
        if response.status_code == 503:
            error_msg = f"Gemini API şu an Google sunucularındaki yoğunluk nedeniyle yanıt veremiyor (503 Service Unavailable).\nDetay: {last_error_detail}"
        elif response.status_code == 429:
            error_msg = f"Gemini API istek limitine ulaşıldı (429 Too Many Requests). Sistemsel bir kota aşımı söz konusu.\nDetay: {last_error_detail}"
        else:
            error_msg = last_error_detail

        raise HTTPException(
            status_code=response.status_code if is_rate_limit else 500,
            detail=error_msg,
        )

    if response is None:
        raise HTTPException(status_code=500, detail="Gemini API request failed before a response was received.")

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
    except json.JSONDecodeError as parse_err:
        # Log the raw AI text for debugging
        print(f"⚠️ JSON parse failed. Raw AI text (first 1000 chars): {ai_text[:1000]}")
        print(f"⚠️ Parse error: {parse_err}")
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON. Please try again.",
        )

    if country_flag:
        itinerary["country_flag"] = country_flag

    return itinerary