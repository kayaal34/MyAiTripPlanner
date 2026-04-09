import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/useAuthStore";
import { saveTripToFavorites } from "../services/api";
import type { DailyActivity, DailyItinerary } from "../services/api";
import type { Place } from "../type";
import Navbar from "../components/Navbar";
import {
    MapPin, Calendar, Users, Wallet, CloudSun, Heart, Save,
    Clock, Tag, Navigation, Printer, PlusCircle, ChevronRight,
    Compass, Utensils, Camera, Landmark, ShoppingBag, Music,
    TreePine, Star, Sparkles, Map as MapIcon
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// ─── Travelers mapping ───
const TRAVELERS_DISPLAY: Record<string, string> = {
    yalniz: "Один",
    cift: "Пара",
    aile: "С семьей",
    arkadaslar: "С друзьями",
};

// ─── Budget mapping ───
const BUDGET_DISPLAY: Record<string, { label: string; icon: React.ReactNode }> = {
    ekonomik: { label: "Экономный", icon: <Wallet className="w-4 h-4" /> },
    orta: { label: "Средний", icon: <Wallet className="w-4 h-4" /> },
    luks: { label: "Люкс", icon: <Star className="w-4 h-4" /> },
};

// ─── Activity type icon mapping ───
function getActivityIcon(type: string) {
    const t = (type || "").toLowerCase();
    if (t.includes("food") || t.includes("restaurant") || t.includes("lunch") || t.includes("dinner") || t.includes("breakfast") || t.includes("cafe") || t.includes("ресторан") || t.includes("обед") || t.includes("завтрак") || t.includes("ужин") || t.includes("кафе"))
        return <Utensils className="w-4 h-4" />;
    if (t.includes("museum") || t.includes("gallery") || t.includes("historical") || t.includes("monument") || t.includes("музей") || t.includes("галерея") || t.includes("истор") || t.includes("памятник") || t.includes("мечеть") || t.includes("mosque") || t.includes("church") || t.includes("temple"))
        return <Landmark className="w-4 h-4" />;
    if (t.includes("shop") || t.includes("market") || t.includes("bazaar") || t.includes("магазин") || t.includes("рынок") || t.includes("базар"))
        return <ShoppingBag className="w-4 h-4" />;
    if (t.includes("nature") || t.includes("park") || t.includes("garden") || t.includes("парк") || t.includes("природа") || t.includes("сад"))
        return <TreePine className="w-4 h-4" />;
    if (t.includes("photo") || t.includes("view") || t.includes("scenic") || t.includes("фото") || t.includes("смотровая") || t.includes("вид"))
        return <Camera className="w-4 h-4" />;
    if (t.includes("music") || t.includes("concert") || t.includes("show") || t.includes("музыка") || t.includes("концерт") || t.includes("шоу"))
        return <Music className="w-4 h-4" />;
    if (t.includes("walk") || t.includes("tour") || t.includes("explore") || t.includes("прогулка") || t.includes("тур") || t.includes("экскур"))
        return <Compass className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
}

// ─── Mapbox ───
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_TOKEN) console.warn("VITE_MAPBOX_ACCESS_TOKEN is not set");
mapboxgl.accessToken = MAPBOX_TOKEN;

function MapboxGLMapComponent({ center, places }: { center: [number, number]; places: Place[] }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const placesRef = useRef<Place[]>(places);

    useEffect(() => { placesRef.current = places; }, [places]);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: center,
            zoom: 13,
        });

        map.current.on("load", () => addMarkers());

        const ro = new ResizeObserver(() => map.current?.resize());
        ro.observe(mapContainer.current);
        return () => ro.disconnect();
    }, []);

    const addMarkers = () => {
        if (!map.current) return;
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

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
                <div class="p-3 font-sans">
                    <h3 class="font-bold text-gray-900 mb-1">📍 ${place.name}</h3>
                    ${place.description ? `<p class="text-xs text-gray-600 mb-2">${place.description}</p>` : ''}
                    ${place.address ? `<p class="text-xs text-gray-500 mb-3">${place.address}</p>` : ''}
                    <div class="flex gap-2 text-xs mt-3">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + (place.address ? ', ' + place.address : ''))}" target="_blank" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 rounded font-semibold text-center">Google</a>
                        <a href="https://yandex.com/maps/?text=${encodeURIComponent(place.name + (place.address ? ', ' + place.address : ''))}" target="_blank" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded font-semibold text-center">Yandex</a>
                    </div>
                </div>
            `);

            const marker = new mapboxgl.Marker({ element: markerElement })
                .setLngLat([parseFloat(String(place.lng)), parseFloat(String(place.lat))])
                .setPopup(popup)
                .addTo(map.current!);

            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                popup.addTo(map.current!);
            });

            markersRef.current.push(marker);
        });
    };

    useEffect(() => {
        if (map.current?.isStyleLoaded()) addMarkers();
    }, [places]);

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

// ─── Main Component ───
export default function TripPlanResult() {
    const navigate = useNavigate();
    const currentTripPlan = useTripStore((s) => s.currentTripPlan);
    const currentTripFormData = useTripStore((s) => s.currentTripFormData);
    const { token } = useAuthStore();

    const [isSaving, setIsSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [tripName, setTripName] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeDay, setActiveDay] = useState<number>(1);

    useEffect(() => {
        if (!currentTripPlan) navigate("/");
    }, [currentTripPlan, navigate]);

    useEffect(() => {
        if (!currentTripPlan?.daily_itinerary?.length) return;
        const firstDay = currentTripPlan.daily_itinerary[0]?.day;
        if (typeof firstDay === "number") setActiveDay(firstDay);
    }, [currentTripPlan]);

    // ─── Save handler ───
    const handleSaveTrip = async () => {
        if (!token) { alert("Для сохранения необходимо войти в систему!"); navigate("/"); return; }
        if (!tripName.trim()) { alert("Пожалуйста, введите название поездки!"); return; }
        if (!currentTripFormData) { alert("Данные формы не найдены!"); return; }
        if (!currentTripPlan) { alert("Данные плана не найдены!"); return; }

        setIsSaving(true);
        try {
            await saveTripToFavorites(
                currentTripPlan, tripName, currentTripFormData.city,
                currentTripFormData.days, currentTripFormData.travelers,
                currentTripFormData.interests, currentTripFormData.budget || "orta",
                currentTripFormData.transport || "farketmez", token,
            );
            setSaveSuccess(true);
            setTimeout(() => { setShowSaveModal(false); setSaveSuccess(false); setTripName(""); }, 2000);
        } catch (error: unknown) {
            console.error("Save trip error:", error);
            alert(error instanceof Error ? error.message || "Ошибка при сохранении" : "Ошибка при сохранении");
        } finally { setIsSaving(false); }
    };

    // ─── Derived data ───
    const allPlaces = useMemo(() => {
        if (!currentTripPlan) return [];
        const places: Place[] = [];
        let placeId = 0;
        currentTripPlan.daily_itinerary.forEach((day: DailyItinerary) => {
            day.activities.forEach((activity: DailyActivity) => {
                const lat = Number(activity?.coordinates?.lat);
                const lng = Number(activity?.coordinates?.lng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return;
                places.push({
                    id: `place-${placeId++}`, name: activity.name || "Activity",
                    lat, lng, address: activity.address || "",
                    description: activity.description || "", day: day.day,
                    timeSlot: activity.time || "",
                });
            });
        });
        return places;
    }, [currentTripPlan]);

    const selectedDay = useMemo<DailyItinerary | null>(() => {
        if (!currentTripPlan?.daily_itinerary?.length) return null;
        return currentTripPlan.daily_itinerary.find((d) => d.day === activeDay) || currentTripPlan.daily_itinerary[0];
    }, [currentTripPlan, activeDay]);

    const selectedDayPlaces = useMemo<Place[]>(() => {
        if (!selectedDay) return [];
        return allPlaces.filter((p) => p.day === selectedDay.day);
    }, [allPlaces, selectedDay]);

    const mapCenter = useMemo<[number, number]>(() => {
        const src = selectedDayPlaces.length > 0 ? selectedDayPlaces : allPlaces;
        if (src.length === 0) return [28.9784, 41.0082];
        const avgLat = src.reduce((s, p) => s + p.lat, 0) / src.length;
        const avgLng = src.reduce((s, p) => s + p.lng, 0) / src.length;
        return [avgLng, avgLat];
    }, [allPlaces, selectedDayPlaces]);

    if (!currentTripPlan) return null;
    const { trip_summary, daily_itinerary } = currentTripPlan;

    const budgetInfo = currentTripFormData?.budget
        ? BUDGET_DISPLAY[currentTripFormData.budget] || BUDGET_DISPLAY.orta
        : BUDGET_DISPLAY.orta;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar />

            {/* ─── Hero Section ─── */}
            <div className="relative overflow-hidden bg-white">
                {/* Background image with overlay */}
                <div className="absolute inset-0">
                    {currentTripPlan.city_image && (
                        <img
                            src={currentTripPlan.city_image}
                            alt={trip_summary.destination}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* Modern gradient fade to transition smoothly into the light page background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-[#f8fafc]" />
                </div>

                <div className="relative container mx-auto px-4 pt-32 pb-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-white/70 mb-6 font-medium">
                            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate("/")}>Главная</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-orange-400 font-semibold">Маршрут</span>
                        </div>

                        {/* Title */}
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-6 h-6 text-orange-400" />
                            <span className="text-orange-400 font-bold text-sm tracking-widest uppercase">Ваш персональный маршрут</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
                            {trip_summary.destination}
                        </h1>
                        <p className="text-lg text-white/90 max-w-2xl mb-10 font-medium">
                            {trip_summary.duration_days}{" "}
                            {trip_summary.duration_days === 1 ? "день" : trip_summary.duration_days < 5 ? "дня" : "дней"} незабываемых впечатлений
                        </p>
                    </div>

                    {/* Save button - floating */}
                    <div className="absolute top-32 right-4 md:right-8">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="group flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-orange-500 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                        >
                            <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Weather & Quick Stats Bar ─── */}
            <div className="container mx-auto px-4 -mt-6 relative z-10 mb-10">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 shadow-sm">
                    {/* Left: Weather */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <CloudSun className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="whitespace-nowrap">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Лучший сезон</p>
                                <p className="text-gray-900 font-bold">{trip_summary.best_season}</p>
                            </div>
                        </div>
                        <div className="hidden md:block w-px h-10 bg-gray-200 mx-2" />
                        <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-xl">{trip_summary.weather_forecast}</p>
                    </div>

                    {/* Right: Quick Stats */}
                    <div className="flex flex-wrap items-center gap-3 xl:justify-end flex-shrink-0">
                        {[
                            { icon: <Calendar className="w-4 h-4" />, label: `${trip_summary.duration_days} ${trip_summary.duration_days === 1 ? "день" : trip_summary.duration_days < 5 ? "дня" : "дней"}` },
                            { icon: <Users className="w-4 h-4" />, label: currentTripFormData?.travelers ? TRAVELERS_DISPLAY[currentTripFormData.travelers] || currentTripFormData.travelers : trip_summary.travelers },
                            { icon: budgetInfo.icon, label: budgetInfo.label },
                            { icon: <Wallet className="w-4 h-4" />, label: trip_summary.total_estimated_cost },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-sm shadow-sm transition-colors hover:border-orange-500/30 whitespace-nowrap">
                                <span className="text-orange-500">{stat.icon}</span>
                                {stat.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="container mx-auto px-4 pb-20">
                {/* Day Tabs */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {daily_itinerary.map((day: DailyItinerary) => (
                            <button
                                key={day.day}
                                onClick={() => setActiveDay(day.day)}
                                className={`whitespace-nowrap px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${selectedDay?.day === day.day
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                        : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm"
                                    }`}
                            >
                                День {day.day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ─── Left: Day Activities (Timeline) ─── */}
                    <div className="lg:col-span-3 space-y-0">
                        {selectedDay && (
                            <>
                                {/* Day Header */}
                                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                                            {selectedDay.title}
                                        </h2>
                                        <p className="text-gray-500 font-medium">{selectedDay.date}</p>
                                    </div>

                                    {/* Day budget & transport */}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDay.estimated_daily_budget && (
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                <Wallet className="w-4 h-4 text-orange-500" />
                                                Итог: {selectedDay.estimated_daily_budget}
                                            </div>
                                        )}
                                        {selectedDay.transportation_note && (
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                <Navigation className="w-4 h-4 text-orange-500" />
                                                {selectedDay.transportation_note}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-200" />

                                    <div className="space-y-6">
                                        {selectedDay.activities.map((activity: DailyActivity, idx: number) => (
                                            <div
                                                key={idx}
                                                className="group relative pl-12"
                                                style={{ animationDelay: `${idx * 80}ms` }}
                                            >
                                                {/* Timeline dot */}
                                                <div className="absolute left-2.5 top-6 w-[20px] h-[20px] rounded-full border-4 border-[#f8fafc] bg-orange-500 shadow-sm z-10 group-hover:scale-125 transition-all duration-300" />

                                                {/* Card */}
                                                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 shadow-sm">
                                                    {/* Top row: time + badges */}
                                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                                        <span className="flex items-center gap-1.5 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-lg">
                                                            <Clock className="w-4 h-4" />
                                                            {activity.time || "—"}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-gray-600 text-sm font-semibold bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                            {getActivityIcon(activity.type)}
                                                            {activity.type || "Активность"}
                                                        </span>
                                                        {activity.duration && (
                                                            <span className="text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-lg font-medium border border-gray-100">
                                                                {activity.duration}
                                                            </span>
                                                        )}
                                                        {activity.cost && (
                                                            <span className="text-emerald-700 text-sm bg-emerald-50 px-3 py-1 rounded-lg font-bold border border-emerald-100">
                                                                {activity.cost}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                                        {activity.name || "Активность"}
                                                    </h4>

                                                    {/* Description */}
                                                    {activity.description && (
                                                        <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
                                                            {activity.description}
                                                        </p>
                                                    )}

                                                    {/* Address */}
                                                    {activity.address && (
                                                        <div className="flex items-start gap-2 pt-4 border-t border-gray-100 mt-2">
                                                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            <p className="text-gray-500 text-sm font-medium">{activity.address}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ─── Right: Map (sticky) ─── */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100/80 rounded-xl">
                                            <MapIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-900 font-bold text-sm">Карта маршрута</h3>
                                            <p className="text-gray-500 text-xs font-medium mt-0.5">
                                                {selectedDay ? `День ${selectedDay.day}` : "Все точки"} · {selectedDayPlaces.length || allPlaces.length} мест
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[480px]">
                                    <MapboxGLMapComponent
                                        center={mapCenter}
                                        places={selectedDayPlaces.length > 0 ? selectedDayPlaces : allPlaces}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Action Buttons ─── */}
                <div className="flex flex-col sm:flex-row gap-4 mt-14 max-w-xl">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5 opacity-70" />
                        Новый маршрут
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-orange-500/25"
                    >
                        <Printer className="w-5 h-5" />
                        Печать / PDF
                    </button>
                </div>
            </div>

            {/* ─── Save Modal ─── */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
                        {saveSuccess ? (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <Heart className="w-10 h-10 text-emerald-500" fill="currentColor" />
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Сохранено!</h3>
                                <p className="text-gray-600 font-medium">Маршрут добавлен в избранное</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-orange-50 rounded-2xl">
                                        <Save className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Сохранить маршрут</h3>
                                        <p className="text-gray-500 text-sm font-medium mt-1">Дайте название вашему путешествию</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={tripName}
                                    onChange={(e) => setTripName(e.target.value)}
                                    placeholder="Напр: Стамбул 2025, Летнее путешествие..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 mb-6 transition-all font-medium"
                                    disabled={isSaving}
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowSaveModal(false); setTripName(""); }}
                                        className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                        disabled={isSaving}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        onClick={handleSaveTrip}
                                        className="flex-1 px-6 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                                        disabled={isSaving || !tripName.trim()}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Сохранение
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-5 h-5" />
                                                Сохранить
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
    );
}
