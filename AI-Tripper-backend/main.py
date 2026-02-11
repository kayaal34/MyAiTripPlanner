from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.llm_service import generate_places

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    city: str
    interests: list[str]
    stops: int
    mode: str = "walk"

# Debug middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "POST":
        body = await request.body()
        print(f"RECEIVED BODY: {body.decode()}")
    response = await call_next(request)
    return response

@app.post("/api/route")
async def generate_route(data: RouteRequest):
    print(f"Received request: {data}")
    
    places = await generate_places(
        city=data.city,
        interests=data.interests,
        stop_count=data.stops,
    )
    
    # Frontend'in beklediği format
    formatted_places = [
        {
            "id": str(i),  # Frontend id bekliyor
            "name": place["name"],
            "lat": float(place["lat"]),
            "lng": float(place["lng"]),  # lng olmalı (lon değil)
            "address": place.get("address", ""),
            "description": place.get("description", "")
        }
        for i, place in enumerate(places)
    ]
    
    return {
        "places": formatted_places,
        "route": {
            "mode": data.mode,
            "distanceKm": 5.2,  # Mock değer
            "durationMinutes": 45  # Mock değer
        }
    }

@app.get("/api/places")
async def get_places_list(city: str = "Istanbul", interests: str = "culture", stops: int = 3):
    interest_list = interests.split(",")
    places = await generate_places(city, interest_list, stops)
    return {"success": True, "places": places}

@app.post("/api/places")
async def get_places(data: RouteRequest):
    places = await generate_places(data.city, data.interests, data.stops)
    return {"success": True, "places": places}