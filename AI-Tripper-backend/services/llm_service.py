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
        budget = trip_data.get('budget', 'orta')
        start_date = trip_data.get('start_date', '')
        
        # Ülke bilgilerini al (REST Countries API)
        country_context, country_flag = await get_country_context(city)
        
        interests_text = ", ".join(interests) if interests else "общий туризм"
        
        # Бюджетные диапазоны (пример, валюта может варьироваться по городам)
        budget_ranges = {
            "ekonomik": "экономичный (суточный бюджет 500-1000 TL)",
            "orta": "средний (суточный бюджет 1000-2500 TL)",
            "luks": "люкс (суточный бюджет 2500+ TL)"
        }
        budget_description = budget_ranges.get(budget.lower(), budget_ranges["orta"])
        
        # Специальные инструкции в зависимости от типа путешественника
        traveler_guides = {
            "yalniz": "Для одиноких путешественников: общественные места, безопасные маршруты, рекомендации хостелей/кафе, мероприятия для одного человека",
            "cift": "Для пар: романтичные рестораны, места заката, интимная атмосфера, парные экскурсии (спа, дегустация вина)",
            "aile": "Для семей: рестораны для детей, образовательные и развлекательные мероприятия, безопасные места, парки, экономичные варианты",
            "arkadaslar": "Для групп друзей: ночная жизнь, групповые мероприятия (квест, боулинг), социальные места, экстремальные виды спорта"
        }
        traveler_context = traveler_guides.get(travelers.lower(), traveler_guides["yalniz"])
        
        # Профессиональный гид-подсказка (обогащена информацией из REST Countries API)
        prompt = f"""
Вы - самый престижный гид-туристический консультант города {city}. Рекомендуйте только реальные места.

{country_context}

Клиент: {travelers}, Бюджет: {budget_description}, Интересы: {interests_text}, {days} дней.

⚠️ КРИТИЧЕСКИЕ ПРАВИЛА JSON:
1. Все описания МАКСИМУМ 80 символов
2. Используйте русские символы, но будьте внимательны с кавычками
3. Используйте только реальные названия мест (запрещены обобщённые названия)
4. Каждое строковое значение должно быть в двойных кавычках

⚠️ КРИТИЧЕСКИЕ ИНСТРУКЦИИ ДЛЯ GENERAL_TIPS:
- local_customs: СПЕЦИФИЧНЫЕ для {city} культурные нормы, этикет, запреты, нормы поведения
- safety: СПЕЦИФИЧНЫЕ советы по безопасности для {city} (безопасные/опасные районы, техники мошенничества, статус полиции)
- money: Детали валюты, комиссии банкоматов, возможность оплаты кредитной картой, культура чаевых, обмен валюты
- emergency_contacts: РЕАЛЬНЫЕ номера аварийных служб {city} (полиция, скорая помощь, пожарная служба, туристическая полиция если есть)
- useful_phrases: 6-8 ПОЛЕЗНЫХ фраз на местном языке (приветствие, спасибо, помощь, цена, направление и т.д.)

SADECE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER:

{{
  "trip_summary": {{
    "destination": "{city}",
    "duration_days": {days},
    "total_estimated_cost": "Прим: 15.000 TL",
    "best_season": "Прим: Весна",
    "weather_forecast": "Прим: Солнечно и тепло"
  }},
  "daily_itinerary": [
    {{
      "day": 1,
      "title": "Творческое название дня",
      "morning": {{
        "time": "09:00-12:00",
        "activities": [
          {{
            "name": "Реальное название места",
            "type": "museum",
            "address": "Реальный адрес или район",
            "coordinates": {{"lat": 41.0122, "lng": 28.9760}},
            "duration": "2 часа",
            "cost": "200 TL",
            "description": "Краткое описание (макс 80 символов)",
            "tips": "Совет (макс 60 символов)"
          }}
        ]
      }},
      "lunch": {{
        "time": "12:00-14:00",
        "restaurant": {{
          "name": "Реальное название ресторана",
          "address": "Реальный адрес",
          "coordinates": {{"lat": 41.0130, "lng": 28.9770}},
          "cuisine": "Тип кухни",
          "average_cost": "Стоимость на человека",
          "recommended_dishes": ["Блюдо 1", "Блюдо 2"],
          "description": "Краткое описание (макс 60 символов)"
        }}
      }},
      "afternoon": {{
        "time": "14:00-18:00",
        "activities": [
          {{
            "name": "Реальное место",
            "type": "cultural",
            "address": "Реальный адрес",
            "coordinates": {{"lat": 41.0140, "lng": 28.9780}},
            "duration": "3 часа",
            "cost": "Стоимость",
            "description": "Краткое описание (макс 60 символов)"
          }}
        ]
      }},
      "evening": {{
        "time": "18:00-22:00",
        "dinner": {{
          "name": "Реальный ресторан",
          "address": "Адрес",
          "coordinates": {{"lat": 41.0150, "lng": 28.9790}},
          "cuisine": "Кухня",
          "average_cost": "Стоимость",
          "description": "Краткое описание (макс 60 символов)"
        }},
        "night_activities": ["Мероприятие 1", "Мероприятие 2"]
      }},
      "daily_tips": {{
        "weather": "Прогноз погоды",
        "clothing": "Рекомендация по одежде",
        "estimated_daily_budget": "Суточный бюджет"
      }},
      "transportation": {{
        "getting_around": "Транспорт",
        "estimated_transport_cost": "Стоимость"
      }}
    }}
  ],
  "accommodation_suggestions": [
    {{
      "name": "Реальное название отеля",
      "type": "hotel",
      "location": "Район",
      "price_range": "Цена",
      "description": "Краткое описание (макс 60 символов)"
    }}
  ],
  "general_tips": {{
    "local_customs": "РЕАЛЬНЫЕ культурные нормы и этикет города {city} (примеры: одежда, приветствия, религия, культура чаевых)",
    "safety": "СПЕЦИФИЧЕСКИЕ советы по безопасности для {city} (безопасные/опасные районы, схемы мошенничества, статус полиции)",
    "money": "Валюта: реальные пункты обмена, комиссии банкоматов, места, где принимают кредитные карты, процент чаевых, культура торга",
    "emergency_contacts": {{
      "police": "Номер полиции {city} (реальный)",
      "ambulance": "Номер скорой помощи {city} (реальный)",
      "fire": "Номер пожарной службы {city} (реальный)",
      "tourist_police": "Номер туристической полиции {city} (если есть - реальный, иначе пустая строка)"
    }},
    "useful_phrases": [
      "Привет - Эквивалент на местном языке",
      "Спасибо - Эквивалент на местном языке",
      "Пожалуйста - Эквивалент на местном языке",
      "Сколько это стоит? - Эквивалент на местном языке",
      "Помощь! - Эквивалент на местном языке",
      "Где? - Эквивалент на местном языке"
    ]
  }},
  "packing_list": ["Предмет 1", "Предмет 2", "Предмет 3"]
}}

Создайте план на {days} дней в вышеуказанном формате JSON.

КРИТИЧЕСКИе требования: 
- ТОЛЬКО действительный JSON (без объяснений и комментариев)
- Все описания короче 80 символов
- Используйте только реальные названия мест/ресторанов
- Координаты должны быть реальными
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
        
        # Asenkron HTTP isteği (detaylı timeout ayarları)
        timeout_config = httpx.Timeout(
            connect=30.0,  # Bağlantı kurma: 30 saniye
            read=120.0,    # Veri okuma: 120 saniye (Gemini yavaş olabilir)
            write=30.0,    # Veri yazma: 30 saniye
            pool=30.0      # Connection pool: 30 saniye
        )
        
        try:
            async with httpx.AsyncClient(timeout=timeout_config) as client:
                response = await client.post(url, headers=headers, json=data)
        except httpx.ConnectTimeout:
            print("⏱️ Gemini API bağlantı timeout'u (30 saniye)")
            raise HTTPException(
                status_code=504,
                detail="Gemini API'ye bağlanılamadı. İnternet bağlantınızı kontrol edin veya daha sonra tekrar deneyin."
            )
        except httpx.ReadTimeout:
            print("⏱️ Gemini API okuma timeout'u (120 saniye)")
            raise HTTPException(
                status_code=504,
                detail="API yanıt vermedi. Daha kısa bir süre veya daha az gün seçerek tekrar deneyin."
            )
        
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
            
    except httpx.ConnectTimeout:
        # Yukarıda zaten yakalanıyor ama güvenlik için burada da ekleyelim
        raise
    except httpx.ReadTimeout:
        # Yukarıda zaten yakalanıyor ama güvenlik için burada da ekleyelim
        raise
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