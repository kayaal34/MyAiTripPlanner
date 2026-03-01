import os
import json
import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

# =====================================================================
# TÜM MOCK FONKSİYONLAR KALDIRILDI
# Gemini API çalışmazsa düzgün hata mesajı verilecek
# Sadece gerçek verilerle plan oluşturulacak
# =====================================================================

async def get_country_context(city: str) -> tuple[str, str]:
    """REST Countries API'den ülke bilgilerini al ve LLM için context + bayrak URL döndür"""
    try:
        # Şehir isminden ülke ismini tahmin et (basit mapping)
        city_to_country = {
            "paris": "france", "istanbul": "turkey", "i̇stanbul": "turkey", "roma": "italy", "rome": "italy",
            "barselona": "spain", "barcelona": "spain", "londra": "united kingdom", "london": "united kingdom",
            "amsterdam": "netherlands", "berlin": "germany", "prag": "czechia", "prague": "czechia",
            "viyana": "austria", "vienna": "austria", "budapeşte": "hungary", "budapest": "hungary",
            "atina": "greece", "athens": "greece", "dubai": "united arab emirates",
            "tokyo": "japan", "new york": "united states", "bangkok": "thailand",
            "singapur": "singapore", "singapore": "singapore", "sydney": "australia",
            "lizbon": "portugal", "lisbon": "portugal", "madrid": "spain", "münih": "germany", "munich": "germany",
            "ankara": "turkey", "antalya": "turkey", "bodrum": "turkey", "kapadokya": "turkey"
        }
        
        # Şehir ismindeki ", Ülke" kısmını temizle
        city_clean = city.split(",")[0].strip().lower()
        country_name = city_to_country.get(city_clean, "")
        
        if not country_name:
            return ("", "")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://restcountries.com/v3.1/name/{country_name}?fullText=false",
                timeout=5.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    country = data[0]
                    
                    languages = ", ".join(list(country.get("languages", {}).values())[:3])
                    currencies = ", ".join(list(country.get("currencies", {}).keys())[:2])
                    timezone = country.get("timezones", [""])[0]
                    flag_url = country.get("flags", {}).get("png", "")
                    
                    context = f"""
🌍 ÜLKE BİLGİLERİ ({country.get('name', {}).get('common', '')}):  
- Başkent: {country.get('capital', [''])[0]}
- Diller: {languages}
- Para Birimi: {currencies}
- Saat Dilimi: {timezone}
- Bölge: {country.get('region', '')} - {country.get('subregion', '')}

💡 BU BİLGİLERİ KULLANARAK:
- Para birimi ile gerçekçi fiyatlar ver
- Yerel dilde teşekkür/selamlaşma ifadeleri ekle  
- Saat dilimi farkını belirt (Türkiye ile karşılaştır)
- Kültürel özellikler hakkında ipuçları ver
                    """
                    return (context, flag_url)
    except Exception as e:
        print(f"⚠️ Ülke bilgisi alınamadı: {e}")
    
    return ("", "")

async def generate_detailed_trip_itinerary(trip_data: dict):
    """
    PRODUCTION-READY: Kullanıcının girdiği verilere göre GÜN GÜN detaylı tatil planı oluşturur.
    
    ✅ Async HTTP (httpx.AsyncClient)
    ✅ JSON zorunlu (response_mime_type: application/json)
    ✅ Gemini 2.5 Flash (en yeni model, v1beta uyumlu)
    ✅ Temperature: 0.6 (JSON format uyumu + gerçek yerler)
    ✅ Kısa açıklamalar (max 80 karakter - JSON parse hatasını önler)
    ✅ Kişiselleştirme (travelers, budget, interests)
    ✅ REST Countries API entegrasyonu (para birimi, dil, saat dilimi)
    """
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin."
        )
    
    try:
        # Form verilerini çıkar
        city = trip_data.get('city', 'İstanbul')
        days = trip_data.get('days', 3)
        travelers = trip_data.get('travelers', 'yalniz')
        interests = trip_data.get('interests', [])
        transport = trip_data.get('transport', 'yuruyerek')
        budget = trip_data.get('budget', 'orta')
        start_date = trip_data.get('start_date', '')
        
        # Ülke bilgilerini al (REST Countries API)
        country_context, country_flag = await get_country_context(city)
        
        interests_text = ", ".join(interests) if interests else "genel turizm"
        
        # Bütçe aralıkları (örnek, para birimi şehre göre değişebilir)
        budget_ranges = {
            "dusuk": "ekonomik (günlük 500-1000 TL bütçe)",
            "orta": "orta seviye (günlük 1000-2500 TL bütçe)",
            "yuksek": "lüks (günlük 2500+ TL bütçe)"
        }
        budget_description = budget_ranges.get(budget.lower(), budget_ranges["orta"])
        
        # Seyahat tipine göre özel talimatlar
        traveler_guides = {
            "yalniz": "Solo gezginler için: sosyal mekanlar, güvenli rotalar, hostel/kafe önerileri, tek başına yapılabilir aktiviteler",
            "cift": "Çiftler için: romantik restoranlar, gün batımı noktaları, mahrem atmosfer, çift aktiviteleri (spa, şarap tadımı)",
            "aile": "Aileler için: çocuk dostu restoranlar, eğitici ve eğlenceli aktiviteler, güvenli alanlar, oyun parkları, ekonomik seçenekler",
            "arkadaslar": "Arkadaş grupları için: gece hayatı, grup aktiviteleri (escape room, bowling), sosyal mekanlar, macera sporları"
        }
        traveler_context = traveler_guides.get(travelers.lower(), traveler_guides["yalniz"])
        
        # Profesyonel Rehber Prompt (REST Countries API bilgileriyle zenginleştirildi)
        prompt = f"""
Sen {city} şehrinin en prestijli turist rehberisin. Gerçek mekanlar öner.

{country_context}

Müşteri: {travelers}, Bütçe: {budget_description}, İlgi: {interests_text}, Ulaşım: {transport}, {days} gün.

⚠️ ÖNEMLİ JSON KURALLARI:
1. Tüm açıklamalar MAKSIMUM 80 karakter olmalı
2. Türkçe karakterler kullanabilirsin ama tırnak işaretlerinde dikkatli ol
3. Gerçek mekan isimleri kullan (jenerik isimler yasak)
4. Her string değeri çift tırnak içinde olmalı

SADECE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER:

{{
  "trip_summary": {{
    "destination": "{city}",
    "duration_days": {days},
    "total_estimated_cost": "Örn: 15.000 TL",
    "best_season": "Örn: İlkbahar",
    "weather_forecast": "Örn: Güneşli ve ılık"
  }},
  "daily_itinerary": [
    {{
      "day": 1,
      "title": "Güne yaratıcı bir başlık",
      "morning": {{
        "time": "09:00-12:00",
        "activities": [
          {{
            "name": "Gerçek Mekan İsmi",
            "type": "museum",
            "address": "Gerçek Adres veya Semt",
            "coordinates": {{"lat": 41.0122, "lng": 28.9760}},
            "duration": "2 saat",
            "cost": "200 TL",
            "description": "Kısa açıklama (max 80 karakter)",
            "tips": "İpucu (max 60 karakter)"
          }}
        ]
      }},
      "lunch": {{
        "time": "12:00-14:00",
        "restaurant": {{
          "name": "Gerçek Restoran İsmi",
          "address": "Gerçek Adres",
          "coordinates": {{"lat": 41.0130, "lng": 28.9770}},
          "cuisine": "Mutfak tipi",
          "average_cost": "Kişi başı maliyet",
          "recommended_dishes": ["Yemek 1", "Yemek 2"],
          "description": "Kısa açıklama (max 60 karakter)"
        }}
      }},
      "afternoon": {{
        "time": "14:00-18:00",
        "activities": [
          {{
            "name": "Gerçek Mekan",
            "type": "cultural",
            "address": "Gerçek Adres",
            "coordinates": {{"lat": 41.0140, "lng": 28.9780}},
            "duration": "3 saat",
            "cost": "Maliyet",
            "description": "Kısa açıklama (max 60 karakter)"
          }}
        ]
      }},
      "evening": {{
        "time": "18:00-22:00",
        "dinner": {{
          "name": "Gerçek Restoran",
          "address": "Adres",
          "coordinates": {{"lat": 41.0150, "lng": 28.9790}},
          "cuisine": "Mutfak",
          "average_cost": "Maliyet",
          "description": "Kısa açıklama (max 60 karakter)"
        }},
        "night_activities": ["Aktivite 1", "Aktivite 2"]
      }},
      "daily_tips": {{
        "weather": "Hava durumu",
        "clothing": "Giyim önerisi",
        "estimated_daily_budget": "Günlük bütçe"
      }},
      "transportation": {{
        "getting_around": "Ulaşım",
        "estimated_transport_cost": "Maliyet"
      }}
    }}
  ],
  "accommodation_suggestions": [
    {{
      "name": "Gerçek Otel İsmi",
      "type": "hotel",
      "location": "Semt",
      "price_range": "Fiyat",
      "description": "Kısa açıklama (max 60 karakter)"
    }}
  ],
  "general_tips": {{
    "safety": "Güvenlik ipucu",
    "money": "Para bilgisi",
    "useful_phrases": ["Kelime 1", "Kelime 2"]
  }},
  "packing_list": ["Eşya 1", "Eşya 2", "Eşya 3"]
}}

{days} gün için yukarıdaki JSON formatında plan oluştur.

KRİTİK: 
- SADECE geçerli JSON döndür (açıklama, yorum ekleme)
- Tüm açıklamalar 80 karakterden kısa olmalı
- Gerçek mekan/restoran isimleri kullan
- Koordinatlar gerçek olmalı
        """
        
        # Gemini API'sine asenkron istek gönder
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        headers = {"Content-Type": "application/json"}
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.6,  # Gemini 2.5 için dengeli (gerçek yerler + format uyumu)
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 16384,  # Detaylı plan için yüksek limit
                "response_mime_type": "application/json"  # JSON zorunlu
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
            ]
        }
        
        # Asenkron HTTP isteği
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(url, headers=headers, json=data)
        
        if response.status_code != 200:
            error_detail = response.text[:500]
            print(f"⚠️ Gemini API hatası: {response.status_code}")
            print(f"Response detayı: {error_detail}")
            raise HTTPException(
                status_code=500,
                detail=f"Gemini API hatası ({response.status_code}). Lütfen daha sonra tekrar deneyin."
            )
        
        result = response.json()
        
        # API yanıtı kontrolü
        if 'candidates' not in result or not result['candidates']:
            print(f"⚠️ Gemini yanıtında candidates yok: {result}")
            raise HTTPException(
                status_code=500,
                detail="Gemini API'den geçerli yanıt alınamadı. Lütfen tekrar deneyin."
            )
        
        ai_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # JSON parse et (Gemini direkt JSON döndürür)
        try:
            itinerary = json.loads(ai_text)
            
            # Bayrak URL'ini ekle
            if country_flag:
                itinerary["country_flag"] = country_flag
            
            print(f"✅ {days} günlük production-ready plan oluşturuldu: {city}")
            print(f"   - Travelers: {travelers}")
            print(f"   - Budget: {budget}")
            print(f"   - Interests: {interests_text}")
            return itinerary
            
        except json.JSONDecodeError as e:
            print(f"❌ AI yanıtı JSON parse edilemedi: {e}")
            print(f"Raw AI response (first 1000 chars):\n{ai_text[:1000]}")
            raise HTTPException(
                status_code=500,
                detail="AI'dan gelen yanıt işlenemedi. Lütfen tekrar deneyin."
            )
            
    except httpx.TimeoutException:
        print(f"⏱️ Gemini API timeout (90 saniye aşıldı)")
        raise HTTPException(
            status_code=504,
            detail="API zaman aşımına uğradı. Lütfen tekrar deneyin."
        )
    except httpx.RequestError as e:
        print(f"❌ HTTP istek hatası: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"API bağlantı hatası: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Tatil planı oluşturulurken hata oluştu: {str(e)}"
        )