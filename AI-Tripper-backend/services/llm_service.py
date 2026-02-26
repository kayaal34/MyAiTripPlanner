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
    Kullanıcının girdiği verilere göre GÜN GÜN detaylı tatil planı oluşturur.
    Her gün için sabah, öğle, akşam aktiviteleri, restoranlar, ulaşım bilgileri içerir.
    KIM İLE GİTTİĞİNE GÖRE FARKLI PROMPT kullanır.
    """
    
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠️ GOOGLE_API_KEY bulunamadı, mock plan kullanılıyor")
            return generate_mock_trip_itinerary(trip_data)
        
        # Form verilerini çıkar
        city = trip_data.get('city', 'İstanbul')
        days = trip_data.get('days', 3)
        travelers = trip_data.get('travelers', 'yalniz')  # yalniz, cift, aile, arkadaslar
        interests = trip_data.get('interests', [])
        transport = trip_data.get('transport', 'yuruyerek')
        budget = trip_data.get('budget', 'orta')  # dusuk, orta, yuksek
        start_date = trip_data.get('start_date', '')
        
        # İlgi alanlarını temizle
        interests_text = ", ".join(interests) if interests else "genel turizm"
        
        # KIM İLE GİTTİĞİNE GÖRE ÖZEL PROMPT EKLEMELERİ
        traveler_specific_instructions = {
            "yalniz": """
            🧳 YALNIZ SEYAHAT ÖZEL TAVSİYELER:
            - Sosyal ortamlar ve diğer gezginlerle tanışma fırsatları
            - Solo traveller-friendly kafeler, coworking mekanlar
            - Güvenli ve rahat tek başına yapılabilecek aktiviteler
            - Hostel/otel sosyal alanları, tur grupları
            - Esnek zaman çizelgesi, kendi temponda gezme
            - Fotoğraf çekimi için selfie-friendly yerler
            """,
            "cift": """
            💑 ÇİFT SEYAHATI ÖZEL TAVSİYELER:
            - Romantik restoranlar ve manzaralı mekanlar
            - Gün batımı izlenecek noktalar
            - Çiftler için aktiviteler (şarap tadımı, spa, yat turu)
            - İntim ve özel atmosfere sahip yerler
            - Fotoğraf çekimi için romantik spot'lar
            - Akşam yürüyüşü rotaları
            """,
            "aile": """
            👨‍👩‍👧‍👦 AİLE SEYAHATI ÖZEL TAVSİYELER:
            - Çocuk dostu restoranlar ve menüler
            - Eğlence parkları, hayvanat bahçeleri, aquaparklar
            - Güvenli ve temiz mekanlar
            - Çocuklar için eğitici müzeler ve aktiviteler
            - Oyun alanları, park alanları
            - Bebek/çocuk arabası erişimine uygun yerler
            - Aile bütçesine uygun ekonomik seçenekler
            - Çocukların sıkılmayacağı interaktif aktiviteler
            """,
            "arkadaslar": """
            👥 ARKADAŞ GRUBU SEYAHATI ÖZEL TAVSİYELER:
            - Gece hayatı, barlar, kulüpler
            - Grup aktiviteleri (kaçış odası, bowling, paintball)
            - Macera ve adrenalin dolu etkinlikler
            - Sosyal ve eğlenceli mekanlar
            - Grup yemekleri için uygun restoranlar
            - Fotoğraf çekimi için eğlenceli yerler
            - Gruplar için indirimli aktiviteler
            """
        }
        
        # Seçilen traveller tipine göre özel talimat
        traveler_prompt = traveler_specific_instructions.get(travelers.lower(), "")
        
        # Detaylı prompt oluştur
        prompt = f"""
        {city} şehri için {days} günlük detaylı bir tatil planı oluştur.
        
        Tatil Bilgileri:
        - Şehir: {city}
        - Süre: {days} gün
        - Seyahat Eden: {travelers} 
        - İlgi Alanları: {interests_text}
        - Ulaşım Tercihi: {transport}
        - Bütçe: {budget}
        {f'- Başlangıç Tarihi: {start_date}' if start_date else ''}
        
        {traveler_prompt}
        
        ÖNEMLİ: Yukarıdaki seyahat tipi özelliklerine göre önerileri özelleştir!
        
        Her gün için aşağıdaki detaylı bilgileri içeren bir plan hazırla:
        
        1. SABAH AKTİVİTELERİ (09:00-12:00):
           - Ana ziyaret yerleri (müze, tarihi alan, doğal güzellik vb.)
           - Tahmini süre ve giriş ücreti
           - Nasıl gidilir (adres, koordinat)
        
        2. ÖĞLE YEMEĞİ (12:00-14:00):
           - Önerilen restoran/kafe (isim, adres, özellik)
           - Tahmini maliyet
           - Önerilen yemekler
        
        3. ÖĞLEDENSONRa AKTİVİTELERİ (14:00-18:00):
           - İkinci ana ziyaret noktaları  
           - Alışveriş önerileri
           - Alternatif aktiviteler
        
        4. AKŞAM (18:00-22:00):
           - Akşam yemeği önerileri
           - Gece hayatı veya rahatlatıcı aktiviteler
           - Güvenlik ipuçları
        
        5. GÜNLÜK İPUÇLARI:
           - Hava durumu tahmini
           - Giyim önerisi
           - Önemli notlar
           - Tahmini günlük bütçe
        
        Aşağıdaki JSON formatını kullan:
        
        {{
          "trip_summary": {{
            "destination": "{city}",
            "duration_days": {days},
            "travelers": "{travelers}",
            "total_estimated_cost": "Tahmini toplam maliyet (para birimi ile)",
            "best_season": "En uygun mevsim",
            "weather_forecast": "Genel hava durumu bilgisi"
          }},
          "daily_itinerary": [
            {{
              "day": 1,
              "date": "Tarih bilgisi varsa",
              "title": "Gün başlığı",
              "morning": {{
                "time": "09:00-12:00",
                "activities": [
                  {{
                    "name": "Aktivite/Yer adı",
                    "type": "museum/historical/nature/shopping",
                    "address": "Tam adres",
                    "coordinates": {{"lat": 0.0, "lng": 0.0}},
                    "duration": "Tahmini süre",
                    "cost": "Giriş ücreti",
                    "description": "Kısa açıklama",
                    "tips": "Özel ipuçları"
                  }}
                ]
              }},
              "lunch": {{
                "time": "12:00-14:00",
                "restaurant": {{
                  "name": "Restoran adı",
                  "address": "Adres",
                  "coordinates": {{"lat": 0.0, "lng": 0.0}},
                  "cuisine": "Mutfak türü",
                  "average_cost": "Kişi başı maliyet",
                  "recommended_dishes": ["Yemek 1", "Yemek 2"],
                  "description": "Restoran hakkında"
                }}
              }},
              "afternoon": {{
                "time": "14:00-18:00",
                "activities": [
                  {{
                    "name": "Aktivite adı",
                    "type": "shopping/walking/cultural",
                    "address": "Adres",
                    "coordinates": {{"lat": 0.0, "lng": 0.0}},
                    "duration": "Süre",
                    "cost": "Maliyet",
                    "description": "Açıklama"
                  }}
                ]
              }},
              "evening": {{
                "time": "18:00-22:00",
                "dinner": {{
                  "name": "Restoran adı",
                  "address": "Adres",
                  "coordinates": {{"lat": 0.0, "lng": 0.0}},
                  "cuisine": "Mutfak türü",
                  "average_cost": "Maliyet",
                  "atmosphere": "Atmosfer açıklaması"
                }},
                "night_activities": [
                  "Gece aktivitesi 1",
                  "Gece aktivitesi 2"
                ]
              }},
              "daily_tips": {{
                "weather": "Hava durumu",
                "clothing": "Giyim önerisi",
                "important_notes": "Önemli notlar",
                "estimated_daily_budget": "Günlük tahmini bütçe"
              }},
              "transportation": {{
                "getting_around": "Şehir içi ulaşım önerileri",
                "estimated_transport_cost": "Tahmini ulaşım maliyeti"
              }}
            }}
          ],
          "accommodation_suggestions": [
            {{
              "name": "Otel/Konaklama adı",
              "type": "hotel/hostel/apartment",
              "location": "Konum",
              "price_range": "Fiyat aralığı",
              "why_recommended": "Neden öneriliyor ({travelers} için uygunluğu)"
            }}
          ],
          "general_tips": {{
            "local_customs": "Yerel görgü kuralları",
            "safety": "Güvenlik ipuçları",
            "money": "Para ve bütçe tavsiyeleri",
            "emergency_contacts": "Acil durum numaraları",
            "useful_phrases": "Faydalı kelimeler/cümleler"
          }},
          "packing_list": [
            "Götürülmesi gereken eşya 1",
            "Götürülmesi gereken eşya 2"
          ]
        }}
        
        ÖNEMLI: Sadece geçerli JSON formatında yanıt ver. Gerçek yerler, restoranlar ve koordinatlar kullan.
        Tüm bilgiler güncel ve doğru olmalı. İlgi alanlarına göre özelleştir: {interests_text}
        {travelers} tipine uygun öneriler sun!
        """
        
        # Gemini API'sine istek gönder
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={api_key}"
        
        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 8000,  # Detaylı plan için daha fazla token
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
                itinerary = json.loads(ai_text)
                print(f"🤖 {days} günlük detaylı plan oluşturuldu: {city}")
                return itinerary
                
            except json.JSONDecodeError as e:
                print(f"⚠️ AI itinerary parse edilemedi: {e}")
                print(f"Raw AI response (first 500 chars): {ai_text[:500]}")
                return generate_mock_trip_itinerary(trip_data)
        else:
            print(f"⚠️ Gemini API hatası: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return generate_mock_trip_itinerary(trip_data)
            
    except Exception as e:
        print(f"❌ Detaylı itinerary oluşturma hatası: {e}")
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