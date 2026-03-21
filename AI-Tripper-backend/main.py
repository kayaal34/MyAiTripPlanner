from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import os

from services.llm_service import generate_detailed_trip_itinerary
from database.database import engine, get_db
from database import models
from routes import auth, routes, favorites, history, contact, subscription
from auth.security import get_current_active_user

app = FastAPI(title="AI Tripper API", version="2.0.0")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm origin'lere izin ver (development için)
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
app.include_router(subscription.router)

@app.get("/")
async def root():
    return {
        "message": "AI Tripper API",
        "version": "2.0.0",
        "docs": "/docs",
        "status": "running"
    }

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
    transport: str = "farketmez"
    budget: str = "orta"
    start_date: str = ""

# Helper function: Unsplash'ten mekan görseli al
async def get_place_image(place_name: str, city: str = "istanbul", place_type: str = "landmark") -> str:
    """Unsplash API'den mekan görseli al, hata durumunda fallback URL döndür"""
    
    # Önce statik fallback'leri hazırla (şehir bazlı)
    city_lower = city.lower()
    if place_type == "restaurant":
        # Restaurant için Türk mutfağı görselleri
        fallback = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop"  # Turkish food
    else:
        # Şehir bazlı landmark görselleri
        city_fallbacks = {
            "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",  # Istanbul
            "ankara": "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&h=600&fit=crop",  # Ankara
            "antalya": "https://images.unsplash.com/photo-1605523666787-dcfca8b5db58?w=800&h=600&fit=crop",  # Antalya
            "izmir": "https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=800&h=600&fit=crop",  # Izmir
        }
        fallback = city_fallbacks.get(city_lower, "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop")
    
    try:
        unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if not unsplash_access_key:
            return fallback
        
        # Çok spesifik query oluştur
        if place_type == "restaurant":
            # Restaurant isimleri genelde alakasız sonuç veriyor, direkt fallback kullan
            print(f"📍 Restaurant için statik görsel kullanılıyor: {place_name}")
            return fallback
        else:
            # Landmark için şehir + ülke + mekan ismi
            query = f"{place_name} {city_lower} turkey"
        
        print(f"🔍 Unsplash Query: {query}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                params={
                    "query": query,
                    "per_page": 3,  # İlk 3 sonucu al, daha iyi seçenek olabilir
                    "orientation": "landscape"
                },
                headers={"Authorization": f"Client-ID {unsplash_access_key}"},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    # İlk sonucu kullan (en alakalı olmalı)
                    image_url = data["results"][0]["urls"]["regular"]
                    print(f"✅ Görsel bulundu: {place_name}")
                    return image_url
                else:
                    print(f"⚠️ Unsplash'ta sonuç bulunamadı: {place_name}")
    except Exception as e:
        print(f"⚠️ Unsplash API hatası ({place_name}): {e}")
    
    # Fallback: Şehir bazlı statik görsel
    print(f"📸 Fallback görsel kullanılıyor: {place_name}")
    return fallback

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
    
    # Check user's remaining routes
    if current_user.remaining_routes == 0:
        raise HTTPException(
            status_code=403, 
            detail="Ücretsiz rota hakkınız bitti. Premium'a geçin!"
        )
    
    places = await generate_places(
        city=data.city,
        interests=data.interests,
        stop_count=data.stops,
    )
    
    # Frontend'in beklediği format
    formatted_places = []
    for i, place in enumerate(places):
        # Unsplash'ten gerçek görsel al (şehir bilgisi ile)
        image_url = await get_place_image(
            place["name"], 
            city=data.city,
            place_type="landmark"
        )
        
        formatted_places.append({
            "id": str(i),
            "name": place["name"],
            "lat": float(place["lat"]),
            "lng": float(place["lng"]),
            "address": place.get("address", ""),
            "description": place.get("description", ""),
            # Modern popup için yeni alanlar
            "image": image_url,
            "day": 1,  # Tek günlük rota için 1
            "timeSlot": "Sabah" if i <= 1 else ("Öğleden Sonra" if i <= 3 else "Akşam")
        })
    
    # Decrease remaining routes (if not unlimited)
    if current_user.remaining_routes > 0:
        current_user.remaining_routes -= 1
        await db.commit()
    
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
        },
        "remaining_routes": current_user.remaining_routes
    }

@app.get("/api/places")
async def get_places_list(city: str = "Istanbul", interests: str = "culture", stops: int = 3):
    interest_list = interests.split(",")
    places = await generate_places(city, interest_list, stops)
    return {"success": True, "places": places}


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
    
    # Kredi kontrolü
    if current_user.remaining_routes == 0:
        raise HTTPException(
            status_code=403,
            detail="Rota oluşturma hakkınız kalmadı. Lütfen premium plan satın alın."
        )
    
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
        
        # Her aktivite ve restoran için gerçek görselleri Unsplash'tan çek
        print(f"🖼️ Görseller yükleniyor ({trip_request.city})...")
        if itinerary and "daily_itinerary" in itinerary:
            for day in itinerary["daily_itinerary"]:
                # Morning activities
                if day.get("morning") and day["morning"].get("activities"):
                    for activity in day["morning"]["activities"]:
                        if activity.get("name"):
                            activity["image"] = await get_place_image(
                                activity["name"], 
                                city=trip_request.city,
                                place_type="landmark"
                            )
                
                # Lunch restaurant
                if day.get("lunch") and day["lunch"].get("restaurant") and day["lunch"]["restaurant"].get("name"):
                    day["lunch"]["restaurant"]["image"] = await get_place_image(
                        day["lunch"]["restaurant"]["name"],
                        city=trip_request.city,
                        place_type="restaurant"
                    )
                
                # Afternoon activities
                if day.get("afternoon") and day["afternoon"].get("activities"):
                    for activity in day["afternoon"]["activities"]:
                        if activity.get("name"):
                            activity["image"] = await get_place_image(
                                activity["name"],
                                city=trip_request.city,
                                place_type="landmark"
                            )
                
                # Evening dinner
                if day.get("evening") and day["evening"].get("dinner") and day["evening"]["dinner"].get("name"):
                    day["evening"]["dinner"]["image"] = await get_place_image(
                        day["evening"]["dinner"]["name"],
                        city=trip_request.city,
                        place_type="restaurant"
                    )
        
        print("✅ Görseller yüklendi")
        
        # Kalan rota hakkını azalt (unlimited değilse)
        if current_user.remaining_routes > 0:
            current_user.remaining_routes -= 1
            await db.commit()
            await db.refresh(current_user)
            print(f"✅ Kullanıcı kredisi güncellendi: {current_user.remaining_routes} kaldı")
        
        # NOT: Artık veritabanına otomatik kaydetmiyoruz!
        # Kullanıcı "Kaydet" butonuna basarsa o zaman kaydedilecek.
        
        print(f"✅ {trip_request.days} günlük plan başarıyla oluşturuldu")
        
        return {
            "success": True,
            "itinerary": itinerary,
            "remaining_routes": current_user.remaining_routes,
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