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