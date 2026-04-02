import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/useAuthStore";
import { saveTripToFavorites } from "../services/api";
import Navbar from "../components/Navbar";
import { MapPin, Calendar, Users, DollarSign, Cloud, Coffee, UtensilsCrossed, Sun, Moon, Info, Hotel, AlertCircle, Phone, MessageSquare, Package, Heart, Save, ChevronDown } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Travelers mapping (İngilizce -> Rusça)
const TRAVELERS_DISPLAY: Record<string, string> = {
    "yalniz": "Один",
    "cift": "Пара",
    "aile": "С семьей",
    "arkadaslar": "С друзьями"
};

// Budget mapping (İngilizce -> Rusça + emoji)
const BUDGET_DISPLAY: Record<string, { label: string; color: string; emoji: string }> = {
    "ekonomik": { label: "Экономный", color: "text-green-600", emoji: "💰" },
    "orta": { label: "Средний", color: "text-yellow-600", emoji: "💵" },
    "luks": { label: "Люкс", color: "text-purple-600", emoji: "💎" }
};

// Mapbox token - from environment variable only
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_TOKEN) {
    console.warn('VITE_MAPBOX_ACCESS_TOKEN is not set in environment variables');
}
mapboxgl.accessToken = MAPBOX_TOKEN;

// MapboxGL Map component for TripPlanResult
function MapboxGLMapComponent({ center, places }: { center: [number, number]; places: any[] }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const placesRef = useRef(places);

    // Keep places ref up to date
    useEffect(() => {
        placesRef.current = places;
    }, [places]);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: center,
            zoom: 13,
        });

        map.current.on('load', () => {
            // Add initial markers
            addMarkers();
        });

        // ResizeObserver for responsive map
        const resizeObserver = new ResizeObserver(() => {
            if (map.current) {
                map.current.resize();
            }
        });
        resizeObserver.observe(mapContainer.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const addMarkers = () => {
        if (!map.current) return;

        // Remove old markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add markers
        placesRef.current.forEach((place) => {
            const markerElement = document.createElement('div');
            markerElement.style.width = '28px';
            markerElement.style.height = '28px';
            markerElement.style.background = '#ff3333';
            markerElement.style.border = '2px solid white';
            markerElement.style.borderRadius = '50%';
            markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
            markerElement.style.cursor = 'pointer';

            const popup = new mapboxgl.Popup({
                offset: [0, -10],
                closeButton: true,
                closeOnClick: false
            });

            popup.setHTML(`
                <div class="p-3">
                    <h3 class="font-bold text-gray-800 mb-1">📍 ${place.name}</h3>
                    ${place.description ? `<p class="text-xs text-gray-600 mb-2"><strong>Описание:</strong> ${place.description}</p>` : ''}
                    ${place.address ? `<p class="text-xs text-gray-500 mb-3"><strong>Адрес:</strong> ${place.address}</p>` : ''}
                    <div class="flex gap-2 text-xs mt-3">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + (place.address ? ', ' + place.address : ''))}" target="_blank" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded font-semibold text-center">Google</a>
                        <a href="https://yandex.com/maps/?text=${encodeURIComponent(place.name + (place.address ? ', ' + place.address : ''))}" target="_blank" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-semibold text-center">Yandex</a>
                    </div>
                </div>
            `);

            const marker = new mapboxgl.Marker({ element: markerElement })
                .setLngLat([parseFloat(String(place.lng)), parseFloat(String(place.lat))])
                .setPopup(popup)
                .addTo(map.current!);

            // Click handler
            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                popup.addTo(map.current!);
            });

            markersRef.current.push(marker);
        });
    };

    // Update markers when places change (but map already exists)
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            addMarkers();
        }
    }, [places]);

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden mt-4">
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default function TripPlanResult() {
    const navigate = useNavigate();
    const currentTripPlan = useTripStore((state) => state.currentTripPlan);
    const currentTripFormData = useTripStore((state) => state.currentTripFormData);
    const { token } = useAuthStore();

    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [tripName, setTripName] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Eğer plan yoksa ana sayfaya yönlendir
    useEffect(() => {
        if (!currentTripPlan) {
            navigate("/");
        }
    }, [currentTripPlan, navigate]);

    // Favorilere kaydetme fonksiyonu
    const handleSaveTrip = async () => {
        if (!token) {
            alert("Kaydetmek için giriş yapmalısınız!");
            navigate("/");
            return;
        }

        if (!tripName.trim()) {
            alert("Lütfen seyahat için bir isim girin!");
            return;
        }

        if (!currentTripFormData) {
            alert("Form verileri bulunamadı!");
            return;
        }

        if (!currentTripPlan) {
            alert("Plan verisi bulunamadı!");
            return;
        }

        setIsSaving(true);

        try {
            await saveTripToFavorites(
                currentTripPlan,
                tripName,
                currentTripFormData.city,
                currentTripFormData.days,
                currentTripFormData.travelers,
                currentTripFormData.interests,
                currentTripFormData.budget || "orta",
                currentTripFormData.transport || "farketmez",
                token
            );

            setSaveSuccess(true);
            setTimeout(() => {
                setShowSaveModal(false);
                setSaveSuccess(false);
                setTripName("");
            }, 2000);
        } catch (error: any) {
            console.error("Save trip error:", error);
            alert(error.message || "Kaydetme sırasında hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    // Tüm aktiviteleri haritada göstermek için topla
    const allPlaces = useMemo(() => {
        if (!currentTripPlan) return [];

        const places: any[] = [];
        let placeId = 0;

        currentTripPlan.daily_itinerary.forEach((day) => {
            // Morning activities
            day.morning?.activities?.forEach((activity: any) => {
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    places.push({
                        id: `place-${placeId++}`,
                        name: activity.name,
                        lat: parseFloat(String(activity.coordinates.lat)),
                        lng: parseFloat(String(activity.coordinates.lng)),
                        address: activity.address || '',
                        description: activity.description || '',
                        day: day.day,
                        timeSlot: `Sabah - ${day.morning.time}`,
                        image: activity.image || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop'
                    });
                }
            });

            // Lunch restaurant
            if (day.lunch?.restaurant?.coordinates?.lat && day.lunch?.restaurant?.coordinates?.lng) {
                places.push({
                    id: `place-${placeId++}`,
                    name: day.lunch.restaurant.name,
                    lat: parseFloat(String(day.lunch.restaurant.coordinates.lat)),
                    lng: parseFloat(String(day.lunch.restaurant.coordinates.lng)),
                    address: day.lunch.restaurant.address || '',
                    description: day.lunch.restaurant.description || day.lunch.restaurant.cuisine || '',
                    day: day.day,
                    timeSlot: `Öğle Yemeği - ${day.lunch.time}`,
                    image: (day.lunch.restaurant as any)?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
                });
            }

            // Afternoon activities
            day.afternoon?.activities?.forEach((activity: any) => {
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    places.push({
                        id: `place-${placeId++}`,
                        name: activity.name,
                        lat: parseFloat(String(activity.coordinates.lat)),
                        lng: parseFloat(String(activity.coordinates.lng)),
                        address: activity.address || '',
                        description: activity.description || '',
                        day: day.day,
                        timeSlot: `Öğleden Sonra - ${day.afternoon.time}`,
                        image: activity.image || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop'
                    });
                }
            });

            // Evening dinner
            if (day.evening?.dinner?.coordinates?.lat && day.evening?.dinner?.coordinates?.lng) {
                places.push({
                    id: `place-${placeId++}`,
                    name: day.evening.dinner.name,
                    lat: parseFloat(String(day.evening.dinner.coordinates.lat)),
                    lng: parseFloat(String(day.evening.dinner.coordinates.lng)),
                    address: day.evening.dinner.address || '',
                    description: day.evening.dinner.description || day.evening.dinner.cuisine || '',
                    day: day.day,
                    timeSlot: `Akşam Yemeği - ${day.evening.time}`,
                    image: (day.evening.dinner as any)?.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'
                });
            }
        });

        return places;
    }, [currentTripPlan]);

    // Harita merkezi (tüm yerlerin ortalaması)
    const mapCenter = useMemo<[number, number]>(() => {
        if (allPlaces.length === 0) return [28.9784, 41.0082]; // İstanbul default [lng, lat]

        const avgLat = allPlaces.reduce((sum, p) => sum + p.lat, 0) / allPlaces.length;
        const avgLng = allPlaces.reduce((sum, p) => sum + p.lng, 0) / allPlaces.length;

        return [avgLng, avgLat]; // Correct: [lng, lat]
    }, [allPlaces]);

    if (!currentTripPlan) {
        return null;
    }

    const { trip_summary, daily_itinerary, accommodation_suggestions, general_tips, packing_list } = currentTripPlan;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Navbar />

            <div className="container mx-auto px-4 py-24">
                {/* Trip Summary Header - Premium Design */}
                <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-2xl p-1 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl"></div>
                    <div className="relative bg-white rounded-3xl p-8">
                        <div className="flex items-start justify-between mb-6">
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                Ваш идеальный маршрут готов! 🎉
                            </h1>
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Heart className="w-5 h-5" fill="currentColor" />
                                Сохранить
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Направление</p>
                                    <p className="font-bold text-lg text-gray-800">{trip_summary.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl">
                                <div className="p-3 bg-purple-500 rounded-lg">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Продолжительность</p>
                                    <p className="font-bold text-lg text-gray-800">
                                        {trip_summary.duration_days} {trip_summary.duration_days === 1 ? "день" : trip_summary.duration_days < 5 ? "дня" : "дней"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl">
                                <div className="p-3 bg-pink-500 rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Путешественники</p>
                                    <p className="font-bold text-lg text-gray-800">
                                        {currentTripFormData?.travelers ? TRAVELERS_DISPLAY[currentTripFormData.travelers] || currentTripFormData.travelers : trip_summary.travelers}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                                <div className="p-3 bg-green-500 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Примерная стоимость</p>
                                    <p className="font-bold text-lg text-gray-800">{trip_summary.total_estimated_cost}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl">
                                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Бюджет</p>
                                    <p className="font-bold text-lg">
                                        {currentTripFormData?.budget && BUDGET_DISPLAY[currentTripFormData.budget] ? (
                                            <span className={BUDGET_DISPLAY[currentTripFormData.budget].color}>
                                                {BUDGET_DISPLAY[currentTripFormData.budget].emoji} {BUDGET_DISPLAY[currentTripFormData.budget].label}
                                            </span>
                                        ) : (
                                            <span className="text-gray-800">💵 Средний</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 flex items-start gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Cloud className="w-5 h-5 text-white flex-shrink-0" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-blue-900 text-lg">Лучший сезон</p>
                                <p className="text-blue-800 font-semibold">{trip_summary.best_season}</p>
                                <p className="text-sm text-blue-700 mt-1">{trip_summary.weather_forecast}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HARITA - Tüm Aktiviteler */}
                {allPlaces.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <button
                            onClick={() => setIsMapOpen(!isMapOpen)}
                            className="w-full flex items-center justify-between text-left hover:bg-gray-50 -m-6 p-6 rounded-2xl transition-colors"
                        >
                            <h2 className="text-3xl font-bold text-gray-800">🗺️ Маршрут на карте</h2>
                            <ChevronDown
                                className={`w-8 h-8 text-gray-600 transition-transform duration-300 ${isMapOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {isMapOpen && (
                            <MapboxGLMapComponent
                                center={mapCenter}
                                places={allPlaces}
                            />
                        )}
                    </div>
                )}

                {/* Daily Itinerary */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">📅 Ежедневный маршрут</h2>

                    {daily_itinerary.map((day) => (
                        <div key={day.day} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Day Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                                <h3 className="text-2xl font-bold">День {day.day} - {day.title}</h3>
                                <p className="text-blue-100">{day.date}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Morning */}
                                <div className="border-l-4 border-yellow-400 pl-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Coffee className="w-6 h-6 text-yellow-600" />
                                        <h4 className="text-xl font-semibold text-gray-800">Утро ({day.morning.time})</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {day.morning.activities.map((activity, idx) => (
                                            <div key={idx} className="bg-yellow-50 rounded-lg p-4">
                                                <h5 className="font-bold text-gray-800">{activity.name}</h5>
                                                <p className="text-sm text-gray-600">{activity.type} • {activity.duration} • {activity.cost}</p>
                                                <p className="text-gray-700 mt-2">{activity.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">📍 {activity.address}</p>
                                                {activity.tips && (
                                                    <p className="text-sm text-blue-600 mt-2">💡 {activity.tips}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lunch */}
                                <div className="border-l-4 border-orange-400 pl-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                                        <h4 className="text-xl font-semibold text-gray-800">Обед ({day.lunch.time})</h4>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <h5 className="font-bold text-gray-800">{day.lunch.restaurant.name}</h5>
                                        <p className="text-sm text-gray-600">{day.lunch.restaurant.cuisine} • {day.lunch.restaurant.average_cost}</p>
                                        {day.lunch.restaurant.description && (
                                            <p className="text-gray-700 mt-2">{day.lunch.restaurant.description}</p>
                                        )}
                                        {day.lunch.restaurant.recommended_dishes && (
                                            <p className="text-sm text-green-600 mt-2">
                                                🍽️ Рекомендуемые блюда: {day.lunch.restaurant.recommended_dishes.join(", ")}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">📍 {day.lunch.restaurant.address}</p>
                                    </div>
                                </div>

                                {/* Afternoon */}
                                <div className="border-l-4 border-blue-400 pl-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sun className="w-6 h-6 text-blue-600" />
                                        <h4 className="text-xl font-semibold text-gray-800">День ({day.afternoon.time})</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {day.afternoon.activities.map((activity, idx) => (
                                            <div key={idx} className="bg-blue-50 rounded-lg p-4">
                                                <h5 className="font-bold text-gray-800">{activity.name}</h5>
                                                <p className="text-sm text-gray-600">{activity.type} • {activity.duration} • {activity.cost}</p>
                                                <p className="text-gray-700 mt-2">{activity.description}</p>
                                                <p className="text-sm text-gray-500 mt-1">📍 {activity.address}</p>
                                                {activity.tips && (
                                                    <p className="text-sm text-blue-600 mt-2">💡 {activity.tips}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Evening */}
                                <div className="border-l-4 border-purple-400 pl-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Moon className="w-6 h-6 text-purple-600" />
                                        <h4 className="text-xl font-semibold text-gray-800">Вечер ({day.evening.time})</h4>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-4 mb-3">
                                        <h5 className="font-bold text-gray-800">{day.evening.dinner.name}</h5>
                                        <p className="text-sm text-gray-600">{day.evening.dinner.cuisine} • {day.evening.dinner.average_cost}</p>
                                        {day.evening.dinner.atmosphere && (
                                            <p className="text-gray-700 mt-2">🌟 {day.evening.dinner.atmosphere}</p>
                                        )}
                                        {day.evening.dinner.recommended_dishes && (
                                            <p className="text-sm text-green-600 mt-2">
                                                🍽️ Рекомендуемые блюда: {day.evening.dinner.recommended_dishes.join(", ")}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">📍 {day.evening.dinner.address}</p>
                                    </div>
                                    {day.evening.night_activities.length > 0 && (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <p className="font-semibold text-gray-800 mb-2">Ночные развлечения:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {day.evening.night_activities.map((activity, idx) => (
                                                    <li key={idx} className="text-gray-700">{activity}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Daily Tips */}
                                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info className="w-5 h-5 text-green-600" />
                                        <h4 className="font-semibold text-gray-800">Советы на день</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-600"><span className="font-semibold">Погода:</span> {day.daily_tips.weather}</p>
                                            <p className="text-gray-600 mt-1"><span className="font-semibold">Одежда:</span> {day.daily_tips.clothing}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600"><span className="font-semibold">Бюджет на день:</span> {day.daily_tips.estimated_daily_budget}</p>
                                            <p className="text-gray-600 mt-1"><span className="font-semibold">Транспорт:</span> {day.transportation.getting_around}</p>
                                        </div>
                                    </div>
                                    {day.daily_tips.important_notes && (
                                        <p className="text-orange-600 mt-3">⚠️ {day.daily_tips.important_notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Accommodation Suggestions */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Hotel className="w-8 h-8 text-blue-600" />
                        <h2 className="text-3xl font-bold text-gray-800">🏨 Рекомендации по размещению</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accommodation_suggestions.map((acc, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <h3 className="font-bold text-lg text-gray-800">{acc.name}</h3>
                                <p className="text-sm text-gray-500">{acc.type} • {acc.location}</p>
                                <p className="text-green-600 font-semibold mt-2">{acc.price_range}</p>
                                <p className="text-gray-700 mt-2">{acc.why_recommended}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* General Tips */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="w-8 h-8 text-orange-600" />
                        <h2 className="text-3xl font-bold text-gray-800">💡 Общие советы</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Местные обычаи</h3>
                            <p className="text-gray-700">{general_tips.local_customs}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Безопасность</h3>
                            <p className="text-gray-700">{general_tips.safety}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Деньги</h3>
                            <p className="text-gray-700">{general_tips.money}</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Phone className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Экстренные контакты</h3>
                                {typeof general_tips.emergency_contacts === 'string' ? (
                                    <p className="text-gray-700">{general_tips.emergency_contacts}</p>
                                ) : (
                                    <div className="text-sm text-gray-700 space-y-1">
                                        {(general_tips.emergency_contacts as any)?.police && (
                                            <p>🚓 Полиция: <span className="font-semibold">{(general_tips.emergency_contacts as any).police}</span></p>
                                        )}
                                        {(general_tips.emergency_contacts as any)?.ambulance && (
                                            <p>🚑 Скорая помощь: <span className="font-semibold">{(general_tips.emergency_contacts as any).ambulance}</span></p>
                                        )}
                                        {(general_tips.emergency_contacts as any)?.fire && (
                                            <p>🚒 Пожарная: <span className="font-semibold">{(general_tips.emergency_contacts as any).fire}</span></p>
                                        )}
                                        {(general_tips.emergency_contacts as any)?.tourist_police && (
                                            <p>👮 Туристическая полиция: <span className="font-semibold">{(general_tips.emergency_contacts as any).tourist_police}</span></p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {general_tips.useful_phrases.length > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Полезные фразы</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {general_tips.useful_phrases.map((phrase, idx) => (
                                    <p key={idx} className="text-sm text-gray-700">• {phrase}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Packing List */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="w-8 h-8 text-purple-600" />
                        <h2 className="text-3xl font-bold text-gray-800">🎒 Что взять с собой</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {packing_list.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <p className="text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                    >
                        Создать новый план
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Печать / Сохранить PDF
                    </button>
                </div>

                {/* Save Modal */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                            {saveSuccess ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-8 h-8 text-green-600" fill="currentColor" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Başarılı!</h3>
                                    <p className="text-gray-600">Seyahatiniz favorilere kaydedildi</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Save className="w-6 h-6 text-pink-500" />
                                        Seyahati Kaydet
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Bu seyahat planını favorilerinize kaydetmek için bir isim verin:
                                    </p>
                                    <input
                                        type="text"
                                        value={tripName}
                                        onChange={(e) => setTripName(e.target.value)}
                                        placeholder="Örn: İstanbul Maceram, Yaz Tatili..."
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-pink-500 mb-6"
                                        disabled={isSaving}
                                        autoFocus
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowSaveModal(false);
                                                setTripName("");
                                            }}
                                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                            disabled={isSaving}
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleSaveTrip}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            disabled={isSaving || !tripName.trim()}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Kaydediliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Heart className="w-5 h-5" fill="currentColor" />
                                                    Kaydet
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
