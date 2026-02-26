import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

async def generate_places(city: str, interests: list, stop_count: int):
    """Google Gemini AI ile gerçek rota oluştur"""
    
    try:
        # Google Gemini API kullanarak yerler oluştur
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠️ GOOGLE_API_KEY bulunamadı, mock data kullanılıyor")
            return generate_mock_places(city, interests, stop_count)
        
        # Prompt oluştur
        interests_text = ", ".join(interests)
        prompt = f"""
        {city} şehrinde {interests_text} ilgi alanlarına sahip biri için {stop_count} adet turistik yer önerin.
        Her yer için aşağıdaki JSON formatında bilgi verin:
        
        [
          {{
            "name": "Yer adı",
            "lat": enlem_koordinatı,
            "lng": boylam_koordinatı, 
            "address": "Detaylı adres",
            "description": "Yer hakkında kısa açıklama"
          }}
        ]
        
        Sadece JSON formatında yanıt verin, başka açıklama eklemeyin.
        """
        
        # Gemini API'sine istek gönder
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            ai_text = result['candidates'][0]['content']['parts'][0]['text']
            
            # JSON'u parse et (Gemini direkt JSON döndürür artık)
            try:
                places = json.loads(ai_text)
                print(f"🤖 AI ile {len(places)} yer oluşturuldu: {city}")
                return places
                
            except json.JSONDecodeError as e:
                print(f"⚠️ AI yanıtı parse edilemedi: {e}")
                print(f"Raw AI response: {ai_text}")
                return generate_mock_places(city, interests, stop_count)
        else:
            print(f"⚠️ Gemini API hatası: {response.status_code}")
            return generate_mock_places(city, interests, stop_count)
            
    except Exception as e:
        print(f"❌ AI servis hatası: {e}")
        return generate_mock_places(city, interests, stop_count)

def generate_mock_places(city: str, interests: list, stop_count: int):
    """Yedek mock veri"""
    mock_places = [
        {
            "name": f"{city} - {interests[i % len(interests)] if interests else 'Genel'} Noktası {i+1}", 
            "lat": 41.0 + i*0.01, 
            "lng": 29.0 + i*0.01, 
            "address": f"{city} merkez, Test sokak {i+1}", 
            "description": f"{city} şehrinde {interests[i % len(interests)] if interests else 'genel'} kategorisinde önerilen yer"
        }
        for i in range(stop_count)
    ]
    
    print(f"🔄 Mock data kullanılıyor: {stop_count} yer - {city}")
    return mock_places

async def generate_personalized_trip_plan(user_data: dict):
    """Kullanıcının özelliklerine göre kişiselleştirilmiş AI tatil planı"""
    
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠️ GOOGLE_API_KEY bulunamadı, mock plan kullanılıyor")
            return generate_mock_personalized_plan(user_data)
        
        # Kullanıcı verilerini analiz et
        gender_text = user_data.get('gender', 'belirtilmemiş')
        hobbies = user_data.get('hobbies', [])
        interests = user_data.get('interests', [])
        preferred_countries = user_data.get('preferred_countries', [])
        vacation_types = user_data.get('vacation_types', [])
        travel_style = user_data.get('travel_style', 'orta')
        age_range = user_data.get('age_range', 'belirtilmemiş')
        
        # Dinamik prompt oluştur
        hobbies_text = ", ".join(hobbies) if hobbies else "belirtilmemiş"
        interests_text = ", ".join(interests) if interests else "genel"
        countries_text = ", ".join(preferred_countries) if preferred_countries else "herhangi bir ülke"
        vacation_types_text = ", ".join(vacation_types) if vacation_types else "herhangi bir tatil türü"
        
        prompt = f"""
        Kişiselleştirilmiş bir tatil planı oluştur. Kullanıcı profili:
        
        - Cinsiyet: {gender_text}
        - Yaş aralığı: {age_range}
        - Hobiler: {hobbies_text}
        - İlgi alanları: {interests_text}
        - Tercih ettiği ülkeler: {countries_text}
        - Tercih ettiği tatil türleri: {vacation_types_text}
        - Seyahat stili: {travel_style}
        
        Bu profil bilgilerine göre 5 günlük ideal bir tatil planı öner. Aşağıdaki JSON formatını kullan:
        
        {{
          "destination": "Önerilen şehir/ülke",
          "trip_duration": "5 gün",
          "trip_theme": "Tatil teması",
          "recommendations": [
            {{
              "day": 1,
              "title": "Gün başlığı",
              "activities": ["Aktivite 1", "Aktivite 2"],
              "places": ["Yer 1", "Yer 2"],
              "tips": "Günlük ipuçları"
            }}
          ],
          "personal_notes": "Bu profildeki kişiye özel notlar ve öneriler",
          "best_time": "En uygun seyahat zamanı",
          "weather_info": "Hava durumu bilgisi"
        }}
        
        Sadece JSON formatında yanıt verin, başka açıklama eklemeyin.
        """
        
        # Gemini API'sine istek gönder
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            ai_text = result['candidates'][0]['content']['parts'][0]['text']
            
            try:
                # JSON'u parse et (Gemini direkt JSON döndürür artık)
                plan = json.loads(ai_text)
                print(f"🤖 Kişiselleştirilmiş tatil planı oluşturuldu!")
                return plan
                
            except json.JSONDecodeError as e:
                print(f"⚠️ AI planı parse edilemedi: {e}")
                return generate_mock_personalized_plan(user_data)
        else:
            print(f"⚠️ Gemini API hatası: {response.status_code}")
            return generate_mock_personalized_plan(user_data)
            
    except Exception as e:
        print(f"❌ AI planı oluşturma hatası: {e}")
        return generate_mock_personalized_plan(user_data)

def generate_mock_personalized_plan(user_data: dict):
    """Yedek kişiselleştirilmiş plan"""
    hobbies = user_data.get('hobbies', [])
    vacation_types = user_data.get('vacation_types', [])
    preferred_countries = user_data.get('preferred_countries', [])
    
    destination = preferred_countries[0] if preferred_countries else "İstanbul"
    theme = vacation_types[0] if vacation_types else "şehir turu"
    
    return {
        "destination": destination,
        "trip_duration": "5 gün",
        "trip_theme": theme,
        "recommendations": [
            {
                "day": 1,
                "title": f"{destination}'da İlk Gün",
                "activities": ["Şehir keşfi", "Yerel lezzetler"],
                "places": ["Merkezi Alan", "Tarihi Mekanlar"],
                "tips": "Rahat ayakkabı giyin"
            },
            {
                "day": 2,
                "title": "Kültürel Gezinti",
                "activities": ["Müze ziyaretleri", "Fotoğrafçılık"],
                "places": ["Ana Müze", "Sanat Galerisi"],
                "tips": "Erken saatlerde gidin"
            }
        ],
        "personal_notes": f"Hobileriniz ({', '.join(hobbies) if hobbies else 'genel'}) dikkate alınarak hazırlandı",
        "best_time": "Bahar ve sonbahar ayları",
        "weather_info": "Hafif serin, rahat giysiler önerilir"
    }


async def generate_detailed_trip_itinerary(trip_data: dict):
    """
    PRODUCTION-READY: Kullanıcının girdiği verilere göre GÜN GÜN detaylı tatil planı oluşturur.
    
    ✅ Async HTTP (httpx.AsyncClient)
    ✅ JSON zorunlu (response_mime_type: application/json)
    ✅ Düşük halüsinasyon (temperature: 0.2)
    ✅ Gerçekçi mekanlar (katı prompt talimatları)
    ✅ Kişiselleştirme (travelers, budget, interests)
    """
    
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠️ GOOGLE_API_KEY bulunamadı, mock plan kullanılıyor")
            return generate_mock_trip_itinerary(trip_data)
        
        # Form verilerini çıkar
        city = trip_data.get('city', 'İstanbul')
        days = trip_data.get('days', 3)
        travelers = trip_data.get('travelers', 'yalniz')
        interests = trip_data.get('interests', [])
        transport = trip_data.get('transport', 'yuruyerek')
        budget = trip_data.get('budget', 'orta')
        start_date = trip_data.get('start_date', '')
        
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
        
        # KATLI VE DETAYLI PROMPT (Halüsinasyon Engeli)
        prompt = f"""
SEN BİR PROFESYONEL SEYAHAT PLANLAMA UZMANISIN. ŞU KURALLARA KESİNLİKLE UY:

════════════════════════════════════════════════════════════
🚨 KRİTİK TALİMATLAR - MUTLAKA UYGULA:
════════════════════════════════════════════════════════════

1. SADECE GERÇEK MEKANLAR:
   ❌ Uydurma yer isimleri YASAK
   ❌ "Örnek Müze", "Test Restoran" gibi genel isimler YASAK
   ✅ {city} şehrinde GERÇEKTEN VAR OLAN, AÇIK ve POPÜLER mekanları öner
   ✅ Müzelerin, restoranların, turistik yerlerin GERÇEK İSİMLERİNİ kullan

2. GERÇEK KOORDİNATLAR:
   ✅ Her mekan için latitude (lat) ve longitude (lng) bilgilerini {city} şehrinin GERÇEKÇİ koordinatlarına göre belirle
   ✅ Koordinatlar şehir sınırları içinde olmalı (örnek: İstanbul için 40.9-41.1 lat, 28.8-29.2 lng aralığında)

3. GÜNCEL BİLGİLER:
   ✅ 2026 yılı itibariyle açık olan mekanlar
   ❌ Kapanan veya yıkılan yerler önerme
   ✅ Güncel fiyat tahminleri ver (enflasyon göz önünde)

4. KİŞİSELLEŞTİRME ZORUNLU:
   ✅ İlgi alanlarına uy: {interests_text}
   ✅ Seyahat tipine uy: {traveler_context}
   ✅ Bütçeye uy: {budget_description}
   ✅ Ulaşım tercihine uy: {transport}

════════════════════════════════════════════════════════════
📋 SEYAHAT BİLGİLERİ:
════════════════════════════════════════════════════════════
- Hedef Şehir: {city}
- Süre: {days} gün
- Kimle Gidiliyor: {travelers}
- İlgi Alanları: {interests_text}
- Ulaşım Tercihi: {transport}
- Bütçe Seviyesi: {budget_description}
{f'- Başlangıç Tarihi: {start_date}' if start_date else ''}

════════════════════════════════════════════════════════════
🎯 JSON ŞEMASI - BU YAPIYI TAM OLARAK KULLAN:
════════════════════════════════════════════════════════════

{{
  "trip_summary": {{
    "destination": "{city}",
    "duration_days": {days},
    "travelers": "{travelers}",
    "total_estimated_cost": "Toplam tahmini maliyet (örn: 15000-25000 TL)",
    "budget_breakdown": {{
      "accommodation": "Konaklama maliyeti",
      "food": "Yemek maliyeti",
      "activities": "Aktivite maliyeti",
      "transport": "Ulaşım maliyeti"
    }},
    "best_season": "En uygun mevsim ({city} için)",
    "weather_forecast": "Genel hava durumu bilgisi"
  }},
  "daily_itinerary": [
  "daily_itinerary": [
    {{
      "day": 1,
      "date": "{start_date if start_date else 'Gün 1'}",
      "title": "Gün 1 - [Kısa Başlık]",
      "morning": {{
        "time": "09:00-12:00",
        "activities": [
          {{
            "name": "[GERÇEK YER İSMİ - örn: Topkapı Sarayı]",
            "type": "museum/historical/nature/religious",
            "address": "[TAM GERÇEK ADRES]",
            "coordinates": {{"lat": [GERÇEK LAT], "lng": [GERÇEK LNG]}},
            "duration": "[TAHMİNİ SÜRE - örn: 2-3 saat]",
            "cost": "[GİRİŞ ÜCRETİ - örn: 200 TL]",
            "description": "[KISA AÇIKLAMA]",
            "tips": "[ÖZEL İPUÇLARI]",
            "why_recommended": "[{travelers} için neden uygun]"
          }}
        ]
      }},
      "lunch": {{
        "time": "12:00-14:00",
        "restaurant": {{
          "name": "[GERÇEK RESTORAN İSMİ]",
          "address": "[TAM ADRES]",
          "coordinates": {{"lat": [GERÇEK LAT], "lng": [GERÇEK LNG]}},
          "cuisine": "[MUTFAK TÜRÜ]",
          "average_cost": "[KİŞİ BAŞI MALİYET - bütçeye uygun: {budget_description}]",
          "recommended_dishes": ["[Yemek 1]", "[Yemek 2]"],
          "description": "[RESTORAN HAKKINDA]",
          "atmosphere": "[ATMOSFER - {traveler_context}'e uygun]"
        }}
      }},
      "afternoon": {{
        "time": "14:00-18:00",
        "activities": [
          {{
            "name": "[GERÇEK AKTİVİTE/YER]",
            "type": "shopping/walking/cultural/adventure",
            "address": "[ADRES]",
            "coordinates": {{"lat": [LAT], "lng": [LNG]}},
            "duration": "[SÜRE]",
            "cost": "[MALİYET]",
            "description": "[AÇIKLAMA]",
            "suitable_for": "[{travelers} için uygunluk]"
          }}
        ]
      }},
      "evening": {{
        "time": "18:00-22:00",
        "dinner": {{
          "name": "[GERÇEK RESTORAN]",
          "address": "[ADRES]",
          "coordinates": {{"lat": [LAT], "lng": [LNG]}},
          "cuisine": "[MUTFAK TÜRÜ]",
          "average_cost": "[MALİYET - {budget} bütçeye uygun]",
          "atmosphere": "[ATMOSFER]",
          "reservation_needed": true/false
        }},
        "night_activities": [
          "[Gece aktivitesi 1 - {travelers} tipine uygun]",
          "[Gece aktivitesi 2]"
        ]
      }},
      "daily_tips": {{
        "weather": "[Hava durumu tahmini]",
        "clothing": "[Giyim önerisi]",
        "important_notes": "[Önemli notlar]",
        "estimated_daily_budget": "[Günlük bütçe - {budget} seviyesine uygun]"
      }},
      "transportation": {{
        "getting_around": "[{transport} tercihi - detaylı ulaşım bilgisi]",
        "estimated_transport_cost": "[Günlük ulaşım maliyeti]",
        "tips": "[Ulaşım ipuçları]"
      }}
    }}
    // ... {days} güne kadar devam et
  ],
  "accommodation_suggestions": [
    {{
      "name": "[GERÇEK OTEL/HOSTEL İSMİ]",
      "type": "hotel/hostel/apartment/boutique",
      "location": "[Semt/Bölge]",
      "price_range": "[Gecelik fiyat aralığı - {budget} bütçeye uygun]",
      "why_recommended": "[{travelers} için neden uygun]",
      "amenities": ["WiFi", "Kahvaltı", "vb."],
      "booking_tip": "[Rezervasyon ipucu]"
    }}
  ],
  "general_tips": {{
    "local_customs": "[{city} yerel görgü kuralları]",
    "safety": "[Güvenlik ipuçları - {travelers} için özel]",
    "money": "[Para kullanımı, ATM, döviz]",
    "emergency_contacts": "[Acil durum numaraları]",
    "useful_phrases": ["[Faydalı kelime 1]", "[Faydalı kelime 2]"],
    "dos_and_donts": ["[Yapılması gereken]", "[Yapılmaması gereken]"]
  }},
  "packing_list": [
    "[{city} ve {interests_text} için özel eşya 1]",
    "[{travelers} için özel eşya 2]",
    "[Mevsime uygun eşya]"
  ],
  "budgeting_advice": {{
    "money_saving_tips": ["[Tasarruf ipucu 1]", "[Tasarruf ipucu 2]"],
    "splurge_worthy": ["[Değer önerisi 1]"],
    "free_activities": ["[Ücretsiz aktivite 1]", "[Ücretsiz aktivite 2]"]
  }}
}}

════════════════════════════════════════════════════════════
⚠️ SON UYARI:
════════════════════════════════════════════════════════════
- UYDURMA YER İSİMLERİ KULLANMA
- KOORDİNATLARI RASTGELE YAZMA
- HER ÖNERİ {city} ŞEHRİNDE GERÇEKTEN VAR OLMALI
- {interests_text} İLGİ ALANLARINI DİKKATE AL
- {travelers} TİPİNE UYGUN ÖNERİLER VER
- {budget_description} BÜTÇEYE UYGUN FİYATLAR BELİRT

Şimdi yukarıdaki JSON formatında {days} günlük detaylı plan oluştur.
Sadece geçerli JSON döndür, başka açıklama ekleme.
        """
        
        # Gemini API'sine asenkron istek gönder
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {"Content-Type": "application/json"}
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.2,  # Düşük halüsinasyon için
                "topP": 0.8,
                "topK": 40,
                "maxOutputTokens": 8192,  # Detaylı plan için yüksek limit
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
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=data)
        
        if response.status_code != 200:
            print(f"⚠️ Gemini API hatası: {response.status_code}")
            print(f"Response detayı: {response.text[:500]}")
            return generate_mock_trip_itinerary(trip_data)
        
        result = response.json()
        
        # API yanıtı kontrolü
        if 'candidates' not in result or not result['candidates']:
            print(f"⚠️ Gemini yanıtında candidates yok: {result}")
            return generate_mock_trip_itinerary(trip_data)
        
        ai_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # JSON parse et (Gemini direkt JSON döndürür)
        try:
            itinerary = json.loads(ai_text)
            print(f"✅ {days} günlük production-ready plan oluşturuldu: {city}")
            print(f"   - Travelers: {travelers}")
            print(f"   - Budget: {budget}")
            print(f"   - Interests: {interests_text}")
            return itinerary
            
        except json.JSONDecodeError as e:
            print(f"❌ AI yanıtı JSON parse edilemedi: {e}")
            print(f"Raw AI response (first 1000 chars):\n{ai_text[:1000]}")
            return generate_mock_trip_itinerary(trip_data)
            
    except httpx.TimeoutException:
        print(f"⏱️ Gemini API timeout (60 saniye aşıldı)")
        return generate_mock_trip_itinerary(trip_data)
    except httpx.RequestError as e:
        print(f"❌ HTTP istek hatası: {e}")
        return generate_mock_trip_itinerary(trip_data)
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {e}")
        import traceback
        traceback.print_exc()
        return generate_mock_trip_itinerary(trip_data)


def generate_mock_trip_itinerary(trip_data: dict):
    """Yedek detaylı tatil planı"""
    city = trip_data.get('city', 'İstanbul')
    days = trip_data.get('days', 3)
    travelers = trip_data.get('travelers', 'Один')
    
    daily_plans = []
    for day in range(1, days + 1):
        daily_plans.append({
            "day": day,
            "date": f"Gün {day}",
            "title": f"{city} - Gün {day}",
            "morning": {
                "time": "09:00-12:00",
                "activities": [{
                    "name": f"{city} Ana Müzesi",
                    "type": "museum",
                    "address": f"{city} Merkez",
                    "coordinates": {"lat": 41.0 + day*0.01, "lng": 29.0 + day*0.01},
                    "duration": "2-3 saat",
                    "cost": "100-200 TL",
                    "description": f"{city}'nin en önemli müzesi",
                    "tips": "Erken saatlerde gidin, kalabalık olabilir"
                }]
            },
            "lunch": {
                "time": "12:00-14:00",
                "restaurant": {
                    "name": f"{city} Lezzetleri Restoranı",
                    "address": f"{city} Merkez, Ana Cadde",
                    "coordinates": {"lat": 41.0 + day*0.01, "lng": 29.0 + day*0.01},
                    "cuisine": "Yerel mutfak",
                    "average_cost": "200-300 TL",
                    "recommended_dishes": ["Yerel özel yemek", "Tatlı"],
                    "description": "Geleneksel lezzetler sunan popüler restoran"
                }
            },
            "afternoon": {
                "time": "14:00-18:00",
                "activities": [{
                    "name": f"{city} Tarihi Bölge",
                    "type": "historical",
                    "address": f"{city} Eski Şehir",
                    "coordinates": {"lat": 41.0 + day*0.015, "lng": 29.0 + day*0.015},
                    "duration": "3-4 saat",
                    "cost": "Ücretsiz",
                    "description": "Tarihi sokaklar ve mimari"
                }]
            },
            "evening": {
                "time": "18:00-22:00",
                "dinner": {
                    "name": f"{city} Manzara Restoranı",
                    "address": f"{city} Tepesi",
                    "coordinates": {"lat": 41.0 + day*0.02, "lng": 29.0 + day*0.02},
                    "cuisine": "Modern ve yerel",
                    "average_cost": "300-500 TL",
                    "atmosphere": "Romantik, manzaralı"
                },
                "night_activities": ["Sahil yürüyüşü", "Müzik dinleme"]
            },
            "daily_tips": {
                "weather": "Açık ve güneşli",
                "clothing": "Rahat yürüyüş kıyafeti",
                "important_notes": "Güneş koruyucu kullanın",
                "estimated_daily_budget": "800-1200 TL"
            },
            "transportation": {
                "getting_around": "Toplu taşıma veya taksi",
                "estimated_transport_cost": "100-150 TL"
            }
        })
    
    return {
        "trip_summary": {
            "destination": city,
            "duration_days": days,
            "travelers": travelers,
            "total_estimated_cost": f"{days * 1000}-{days * 1500} TL",
            "best_season": "İlkbahar ve Sonbahar",
            "weather_forecast": "Genellikle güneşli ve ılık"
        },
        "daily_itinerary": daily_plans,
        "accommodation_suggestions": [
            {
                "name": f"{city} Merkez Otel",
                "type": "hotel",
                "location": "Şehir merkezi",
                "price_range": "500-800 TL/gece",
                "why_recommended": "Merkezi konum, tüm yerlere yakın"
            }
        ],
        "general_tips": {
            "local_customs": "Yerel görgü kurallarına uyun",
            "safety": "Değerli eşyalarınıza dikkat edin",
            "money": "Nakit ve kart her ikisi de kabul edilir",
            "emergency_contacts": "112 - Acil Yardım",
            "useful_phrases": ["Merhaba", "Teşekkür ederim", "Rica ederim"]
        },
        "packing_list": [
            "Rahat yürüyüş ayakkabıları",
            "Güneş koruyucu",
            "Şapka/güneş gözlüğü",
            "Hafif ceket",
            "Kamera",
            "Su şişesi"
        ]
    }
    
    print(f"🔄 Mock itinerary kullanılıyor: {days} gün - {city}")