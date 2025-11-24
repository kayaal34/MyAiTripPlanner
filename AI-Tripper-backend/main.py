from fastapi import FastAPI
from pydantic import BaseModel
from services.llm_service import generate_places
from services.route_service import get_optimized_route

app = FastAPI()

class RouteRequest(BaseModel):
    city: str
    interests: list[str]
    stop_count: int
    travel_mode: str

@app.post("/generate-route")
async def generate_route(data: RouteRequest):
    # LLM ile yer önerileri üret
    places = await generate_places(
        city=data.city,
        interests=data.interests,
        stop_count=data.stop_count,
    )

    # Google Maps ile rota optimizasyonu
    route_info = await get_optimized_route(
        places=places,
        travel_mode=data.travel_mode
    )

    # Frontend'e JSON döndür
    return {
        "city": data.city,
        "places": places,
        "route": route_info["route"],
        "distance_km": route_info["distance_km"],
        "duration_min": route_info["duration_min"]
    }
