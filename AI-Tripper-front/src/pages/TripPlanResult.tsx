import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/useAuthStore";
import { saveTripToFavorites } from "../services/api";
import type { DailyActivity, DailyItinerary } from "../services/api";
import type { Place } from "../type";
import Navbar from "../components/Navbar";
import { MapPin, Calendar, Users, DollarSign, Cloud, Heart, Save } from "lucide-react";
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
function MapboxGLMapComponent({ center, places }: { center: [number, number]; places: Place[] }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const placesRef = useRef<Place[]>(places);

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
    const [activeDay, setActiveDay] = useState<number>(1);

    // Eğer plan yoksa ana sayfaya yönlendir
    useEffect(() => {
        if (!currentTripPlan) {
            navigate("/");
        }
    }, [currentTripPlan, navigate]);

    useEffect(() => {
        if (!currentTripPlan?.daily_itinerary?.length) return;
        const firstDay = currentTripPlan.daily_itinerary[0]?.day;
        if (typeof firstDay === "number") {
            setActiveDay(firstDay);
        }
    }, [currentTripPlan]);

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
        } catch (error: unknown) {
            console.error("Save trip error:", error);
            if (error instanceof Error) {
                alert(error.message || "Kaydetme sırasında hata oluştu");
            } else {
                alert("Kaydetme sırasında hata oluştu");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Yeni şema: günlük düz activities dizisinden harita pinlerini topla
    const allPlaces = useMemo(() => {
        if (!currentTripPlan) return [];

        const places: Place[] = [];
        let placeId = 0;

        currentTripPlan.daily_itinerary.forEach((day: DailyItinerary) => {
            day.activities.forEach((activity: DailyActivity) => {
                const lat = Number(activity?.coordinates?.lat);
                const lng = Number(activity?.coordinates?.lng);

                if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
                    return;
                }

                places.push({
                    id: `place-${placeId++}`,
                    name: activity.name || "Activity",
                    lat,
                    lng,
                    address: activity.address || "",
                    description: activity.description || "",
                    day: day.day,
                    timeSlot: activity.time || "",
                });
            });
        });

        return places;
    }, [currentTripPlan]);

    const selectedDay = useMemo<DailyItinerary | null>(() => {
        if (!currentTripPlan?.daily_itinerary?.length) return null;
        return (
            currentTripPlan.daily_itinerary.find((d) => d.day === activeDay) ||
            currentTripPlan.daily_itinerary[0]
        );
    }, [currentTripPlan, activeDay]);

    const selectedDayPlaces = useMemo<Place[]>(() => {
        if (!selectedDay) return [];
        return allPlaces.filter((p) => p.day === selectedDay.day);
    }, [allPlaces, selectedDay]);

    // Harita merkezi (tüm yerlerin ortalaması)
    const mapCenter = useMemo<[number, number]>(() => {
        const sourcePlaces = selectedDayPlaces.length > 0 ? selectedDayPlaces : allPlaces;
        if (sourcePlaces.length === 0) return [28.9784, 41.0082]; // İstanbul default [lng, lat]

        const avgLat = sourcePlaces.reduce((sum, p) => sum + p.lat, 0) / sourcePlaces.length;
        const avgLng = sourcePlaces.reduce((sum, p) => sum + p.lng, 0) / sourcePlaces.length;

        return [avgLng, avgLat]; // Correct: [lng, lat]
    }, [allPlaces, selectedDayPlaces]);

    if (!currentTripPlan) {
        return null;
    }

    const { trip_summary, daily_itinerary } = currentTripPlan;

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

                {/* Day Tabs + Selected Day Content */}
                <div className="mb-8">
                    <div className="mb-4 overflow-x-auto">
                        <div className="inline-flex min-w-full gap-2 rounded-2xl bg-white/80 p-2 shadow-lg backdrop-blur">
                            {daily_itinerary.map((day: DailyItinerary) => (
                                <button
                                    key={day.day}
                                    onClick={() => setActiveDay(day.day)}
                                    className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                                        selectedDay?.day === day.day
                                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                                            : "bg-white text-gray-700 hover:bg-blue-50"
                                    }`}
                                >
                                    Day {day.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="space-y-4 lg:col-span-3">
                            {selectedDay ? (
                                <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                                        <h3 className="text-2xl font-bold">Day {selectedDay.day} - {selectedDay.title}</h3>
                                        <p className="text-blue-100">{selectedDay.date}</p>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <div className="rounded-xl bg-blue-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Estimated Daily Budget</p>
                                                <p className="mt-1 text-lg font-bold text-blue-900">{selectedDay.estimated_daily_budget || "N/A"}</p>
                                            </div>
                                            <div className="rounded-xl bg-indigo-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Transportation</p>
                                                <p className="mt-1 text-sm font-medium text-indigo-900">{selectedDay.transportation_note || "N/A"}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedDay.activities.map((activity: DailyActivity, idx: number) => (
                                                <div key={idx} className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                            {activity.time || "--:--"}
                                                        </span>
                                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                            {activity.type || "activity"}
                                                        </span>
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                            {activity.duration || "N/A"}
                                                        </span>
                                                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                                                            {activity.cost || "N/A"}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-800">{activity.name || "Activity"}</h4>
                                                    {activity.description && (
                                                        <p className="mt-2 text-gray-700">{activity.description}</p>
                                                    )}
                                                    {activity.address && (
                                                        <p className="mt-2 text-sm text-gray-500">📍 {activity.address}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-white p-6 text-gray-600 shadow-lg">No day data available.</div>
                            )}
                        </div>

                        <div className="lg:col-span-2">
                            <div className="sticky top-24 rounded-2xl bg-white p-4 shadow-xl">
                                <h2 className="mb-2 text-xl font-bold text-gray-800">🗺️ Map</h2>
                                <p className="mb-3 text-sm text-gray-500">
                                    {selectedDay
                                        ? `Pins for Day ${selectedDay.day}`
                                        : "Pins for all activities"}
                                </p>
                                <MapboxGLMapComponent
                                    center={mapCenter}
                                    places={selectedDayPlaces.length > 0 ? selectedDayPlaces : allPlaces}
                                />
                            </div>
                        </div>
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
