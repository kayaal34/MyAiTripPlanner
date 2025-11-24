import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_KEY = os.getenv("GOOGLE_MAPS_KEY")

async def get_optimized_route(places: list, travel_mode: str = "walking"):
    """
    Google Directions API kullanarak optimize rota hesaplama.
    places listesi:
    [
      {"name": "Galata Kulesi", "lat": 41.025, "lng": 28.974, "desc": "..."},
      ...
    ]
    """

    # Koordinatları "lat,lng" formatında birleştiriyoruz
    coords = [f"{p['lat']},{p['lng']}" for p in places]

    origin = coords[0]
    destination = coords[-1]

    waypoints = "|".join(coords[1:-1])  # İlk ve son durak hariç

    # Directions API URL
    url = (
        "https://maps.googleapis.com/maps/api/directions/json"
        f"?origin={origin}"
        f"&destination={destination}"
        f"&waypoints=optimize:true|{waypoints}"
        f"&mode={travel_mode}"
        f"&key={GOOGLE_MAPS_KEY}"
    )

    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()

    # Eğer hata varsa
    if data["status"] != "OK":
        raise Exception("Google Directions API hatası: " + data["status"])

    route = data["routes"][0]
    legs = route["legs"]

    # Toplam mesafe ve süre hesaplama
    total_distance_km = sum([l["distance"]["value"] for l in legs]) / 1000
    total_duration_min = sum([l["duration"]["value"] for l in legs]) / 60

    return {
        "route": route["overview_polyline"]["points"],
        "distance_km": round(total_distance_km, 2),
        "duration_min": round(total_duration_min, 1)
    }
