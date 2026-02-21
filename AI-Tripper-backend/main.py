from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from services.llm_service import generate_places
from database.database import engine, get_db
from database import models
from routes import auth, routes, favorites, history
from auth.security import get_current_active_user

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Tripper API", version="2.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(favorites.router)
app.include_router(history.router)

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
async def generate_route(data: RouteRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    print(f"Received request: {data}")
    
    places = await generate_places(
        city=data.city,
        interests=data.interests,
        stop_count=data.stops,
    )
    
    # Frontend'in beklediği format
    formatted_places = [
        {
            "id": str(i),
            "name": place["name"],
            "lat": float(place["lat"]),
            "lng": float(place["lng"]),
            "address": place.get("address", ""),
            "description": place.get("description", "")
        }
        for i, place in enumerate(places)
    ]
    
    # Save to history
    history_entry = models.RouteHistory(
        user_id=current_user.id,
        city=data.city,
        interests=data.interests,
        stops=data.stops,
        mode=data.mode,
        places=formatted_places
    )
    db.add(history_entry)
    db.commit()
    
    return {
        "places": formatted_places,
        "route": {
            "mode": data.mode,
            "distanceKm": 5.2,
            "durationMinutes": 45
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)