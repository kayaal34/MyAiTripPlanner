import os
import json
import requests
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
            }]
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            ai_text = result['candidates'][0]['content']['parts'][0]['text']
            
            # JSON'u parse et
            try:
                # ```json işaretlerini temizle
                clean_text = ai_text.strip()
                if clean_text.startswith('```json'):
                    clean_text = clean_text[7:]
                if clean_text.endswith('```'):
                    clean_text = clean_text[:-3]
                clean_text = clean_text.strip()
                
                places = json.loads(clean_text)
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
        data = {"contents": [{"parts": [{"text": prompt}]}]}
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            ai_text = result['candidates'][0]['content']['parts'][0]['text']
            
            try:
                # JSON'u parse et
                clean_text = ai_text.strip()
                if clean_text.startswith('```json'):
                    clean_text = clean_text[7:]
                if clean_text.endswith('```'):
                    clean_text = clean_text[:-3]
                clean_text = clean_text.strip()
                
                plan = json.loads(clean_text)
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