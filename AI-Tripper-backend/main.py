from typing import Any

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
import traceback
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import os
import logging

from services.llm_service import generate_detailed_trip_itinerary
from database.database import get_db
from database import models
from routes import auth, routes, favorites, history, contact, subscription
from auth.security import get_current_active_user

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("aitripper")

app = FastAPI(title="AI Tripper API", version="2.0.0")
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Sunucu logları için hatayı terminale yazdır
    logger.error(f"🚨 BEKLENMEYEN HATA: {request.method} {request.url} - {str(exc)}", exc_info=True)
    
    # Frontend'e her zaman temiz bir JSON dön
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Sunucuda beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            "detail": str(exc)  # Geliştirme aşamasında hatayı görebilmek için
        }
    )
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

class TripPlanRequest(BaseModel):
    city: str = Field(..., min_length=1)
    days: int = Field(..., ge=1, le=30)
    travelers: str = Field(..., min_length=1)
    interests: list[str] = Field(default_factory=list)
    transport: str = "farketmez"
    budget: str = "orta"
    start_date: str = ""
    language: str = "Turkish"


class DetailedTripItineraryModel(BaseModel):
    trip_summary: dict[str, Any]
    daily_itinerary: list[dict[str, Any]]
    accommodation_suggestions: list[dict[str, Any]] = Field(default_factory=list)
    general_tips: dict[str, Any] = Field(default_factory=dict)
    packing_list: list[str] = Field(default_factory=list)
    country_flag: str | None = None
    city_image: str | None = None

async def get_city_image(city: str = "istanbul") -> str:
    """Fetch a single city-level hero image to avoid one API call per activity."""

    city_lower = city.lower()
    city_fallbacks = {
        "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=800&fit=crop",
        "ankara": "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1200&h=800&fit=crop",
        "antalya": "https://images.unsplash.com/photo-1605523666787-dcfca8b5db58?w=1200&h=800&fit=crop",
        "izmir": "https://images.unsplash.com/photo-1578070181910-f1e514afdd08?w=1200&h=800&fit=crop",
    }
    fallback = city_fallbacks.get(city_lower, "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&h=800&fit=crop")
    
    try:
        unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if not unsplash_access_key:
            return fallback

        query = f"{city_lower} skyline travel"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                params={
                    "query": query,
                    "per_page": 1,
                    "orientation": "landscape"
                },
                headers={"Authorization": f"Client-ID {unsplash_access_key}"},
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    image_url = data["results"][0]["urls"]["regular"]
                    return image_url
    except Exception as e:
        logger.error(f"Unsplash city image error ({city}): {e}")

    return fallback

# Debug middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method == "POST":
        body = await request.body()
        logger.info(f"RECEIVED BODY: {body.decode()}")
    response = await call_next(request)
    return response

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
                    
                    logger.info(f"✅ {info['name']} ülke bilgileri alındı")
                    return {"success": True, "country_info": info}
            
            return {"success": False, "error": "Ülke bulunamadı"}
    except Exception as e:
        print(f"❌ Ülke bilgisi alınamadı: {e}")
        return {"success": False, "error": str(e)}

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
            "start_date": trip_request.start_date,
            "language": trip_request.language,
        }
        
        # AI ile detaylı itinerary oluştur
        raw_itinerary = await generate_detailed_trip_itinerary(trip_data)

        try:
            itinerary = DetailedTripItineraryModel.model_validate(raw_itinerary).model_dump()
        except ValidationError as validation_error:
            print(f"Invalid AI itinerary payload: {validation_error}")
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an invalid itinerary payload. Please try again.",
            )

        itinerary["city_image"] = await get_city_image(trip_request.city)
        
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