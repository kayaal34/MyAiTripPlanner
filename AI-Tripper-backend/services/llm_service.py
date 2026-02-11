import os
import json
from dotenv import load_dotenv

load_dotenv()

async def generate_places(city: str, interests: list, stop_count: int):
    """Basit test için mock data"""
    
    mock_places = [
        {"name": f"Test Place {i+1}", "lat": 41.0 + i*0.01, "lng": 29.0 + i*0.01, "address": f"Address {i+1}", "description": f"Test place in {city}"}
        for i in range(stop_count)
    ]
    
    print(f"✅ Returning {stop_count} mock places for {city}")
    return mock_places