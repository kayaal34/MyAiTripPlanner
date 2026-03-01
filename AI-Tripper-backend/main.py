from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from services.llm_service import generate_detailed_trip_itinerary
from database.database import engine, get_db
from database import models
from routes import auth, routes, favorites, history, contact
from auth.security import get_current_active_user

app = FastAPI(title="AI Tripper API", version="2.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(favorites.router)
app.include_router(history.router)
app.include_router(contact.router)

class RouteRequest(BaseModel):
    city: str
    interests: list[str]
    stops: int
    mode: str = "walk"


class TripPlanRequest(BaseModel):
    city: str
    days: int
    travelers: str
    interests: list[str]
    transport: str
    budget: str = "orta"
    start_date: str = ""

# Debug middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "POST":
        body = await request.body()
        print(f"RECEIVED BODY: {body.decode()}")
    response = await call_next(request)
    return response

@app.post("/api/route")
async def generate_route(data: RouteRequest, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
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
    
    # Save to history (is_saved=False)
    trip_entry = models.Trip(
        user_id=current_user.id,
        city=data.city,
        country=None,
        duration_days=1,
        travelers="yalniz",
        interests=data.interests,
        mode=data.mode,
        places=formatted_places,
        trip_plan={"places": formatted_places},
        is_saved=False
    )
    db.add(trip_entry)
    await db.commit()
    
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


@app.get("/api/destinations")
async def get_popular_destinations():
    """Popüler şehir ve ülke listesini döndür (autocomplete için)"""
    try:
        import json
        import os
        
        # Backend klasöründen data/popular_destinations.json'u oku
        current_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(current_dir, "data", "popular_destinations.json")
        
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        print(f"✅ {len(data['cities'])} şehir yüklendi")
        return {"success": True, "destinations": data["cities"]}
    except Exception as e:
        print(f"❌ Şehir listesi yüklenemedi: {e}")
        # Fallback: Basit liste
        return {
            "success": True,
            "destinations": [
                {"name": "Paris", "country": "Fransa"},
                {"name": "İstanbul", "country": "Türkiye"},
                {"name": "Roma", "country": "İtalya"},
                {"name": "Barselona", "country": "İspanya"},
                {"name": "Londra", "country": "İngiltere"}
            ]
        }

@app.get("/api/country-info/{country_name}")
async def get_country_info(country_name: str):
    """REST Countries API'den ülke bilgilerini çek"""
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            # REST Countries API v3.1
            response = await client.get(
                f"https://restcountries.com/v3.1/name/{country_name}?fullText=false",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    country = data[0]  # İlk sonucu al
                    
                    # İhtiyacımız olan bilgileri çıkar
                    info = {
                        "name": country.get("name", {}).get("common", country_name),
                        "capital": country.get("capital", [""])[0] if country.get("capital") else "",
                        "region": country.get("region", ""),
                        "subregion": country.get("subregion", ""),
                        "languages": list(country.get("languages", {}).values()),
                        "currencies": list(country.get("currencies", {}).keys()),
                        "timezones": country.get("timezones", []),
                        "borders": country.get("borders", []),
                        "population": country.get("population", 0),
                        "flag": country.get("flag", ""),
                        "coat_of_arms": country.get("coatOfArms", {}).get("png", "")
                    }
                    
                    print(f"✅ {info['name']} ülke bilgileri alındı")
                    return {"success": True, "country_info": info}
            
            return {"success": False, "error": "Ülke bulunamadı"}
    except Exception as e:
        print(f"❌ Ülke bilgisi alınamadı: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/places")
async def get_places(data: RouteRequest):
    places = await generate_places(data.city, data.interests, data.stops)
    return {"success": True, "places": places}

@app.post("/api/personalized-trip")
async def create_personalized_trip(
    db: AsyncSession = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    """Kullanıcının özelliklerine göre kişiselleştirilmiş AI tatil planı"""
    
    # Kullanıcı profilini dict'e çevir
    user_profile = {
        "full_name": current_user.full_name,
        "bio": current_user.bio,
        "hobbies": current_user.hobbies or [],
        "interests": current_user.interests or [],
        "gender": current_user.gender,
        "preferred_countries": current_user.preferred_countries or [],
        "vacation_types": current_user.vacation_types or [],
        "travel_style": current_user.travel_style,
        "age_range": current_user.age_range,
    }
    
    # AI ile kişiselleştirilmiş plan oluştur
    plan = await generate_personalized_trip_plan(user_profile)
    
    # Plan geçmişine kaydet (is_saved=False)
    trip_entry = models.Trip(
        user_id=current_user.id,
        city=plan.get("destination", "Personalized Trip"),
        country=None,
        duration_days=5,
        travelers="yalniz",
        interests=current_user.interests or ["kişiselleştirilmiş"],
        mode="personalized",
        trip_plan=plan,
        is_saved=False
    )
    db.add(trip_entry)
    await db.commit()
    
    return {
        "success": True,
        "plan": plan,
        "message": "Kişiselleştirilmiş tatil planınız hazır!"
    }


@app.post("/api/trip-planner")
async def create_detailed_trip_plan(
    trip_request: TripPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Kullanıcının form verilerine göre GÜN GÜN detaylı tatil planı oluşturur.
    Her gün için sabah, öğle, akşam aktiviteleri, restoranlar ve ipuçları içerir.
    """
    
    print(f"📝 Trip plan talebi alındı: {trip_request.city}, {trip_request.days} gün")
    
    try:
        # Form verilerini dict'e çevir
        trip_data = {
            "city": trip_request.city,
            "days": trip_request.days,
            "travelers": trip_request.travelers,
            "interests": trip_request.interests,
            "transport": trip_request.transport,
            "budget": trip_request.budget,
            "start_date": trip_request.start_date
        }
        
        # AI ile detaylı itinerary oluştur
        itinerary = await generate_detailed_trip_itinerary(trip_data)
        
        # NOT: Artık veritabanına otomatik kaydetmiyoruz!
        # Kullanıcı "Kaydet" butonuna basarsa o zaman kaydedilecek.
        
        print(f"✅ {trip_request.days} günlük plan başarıyla oluşturuldu (DB'ye kaydedilmedi)")
        
        return {
            "success": True,
            "itinerary": itinerary,
            "message": f"{trip_request.city} için {trip_request.days} günlük tatil planınız hazır!"
        }
        
    except Exception as e:
        print(f"❌ Trip plan oluşturma hatası: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Tatil planı oluşturulurken bir hata oluştu: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)