import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import Navbar from "../components/Navbar";
import { MapPin, Calendar, Users, DollarSign, Cloud, Coffee, UtensilsCrossed, Sun, Moon, Info, Hotel, AlertCircle, Phone, MessageSquare, Package } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue with Leaflet in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function TripPlanResult() {
    const navigate = useNavigate();
    const currentTripPlan = useTripStore((state) => state.currentTripPlan);

    // Eğer plan yoksa ana sayfaya yönlendir
    useEffect(() => {
        if (!currentTripPlan) {
            navigate("/");
        }
    }, [currentTripPlan, navigate]);

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
                        lat: activity.coordinates.lat,
                        lng: activity.coordinates.lng,
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
                    lat: day.lunch.restaurant.coordinates.lat,
                    lng: day.lunch.restaurant.coordinates.lng,
                    address: day.lunch.restaurant.address || '',
                    description: day.lunch.restaurant.description || day.lunch.restaurant.cuisine || '',
                    day: day.day,
                    timeSlot: `Öğle Yemeği - ${day.lunch.time}`,
                    image: day.lunch.restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
                });
            }

            // Afternoon activities
            day.afternoon?.activities?.forEach((activity: any) => {
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    places.push({
                        id: `place-${placeId++}`,
                        name: activity.name,
                        lat: activity.coordinates.lat,
                        lng: activity.coordinates.lng,
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
                    lat: day.evening.dinner.coordinates.lat,
                    lng: day.evening.dinner.coordinates.lng,
                    address: day.evening.dinner.address || '',
                    description: day.evening.dinner.description || day.evening.dinner.cuisine || '',
                    day: day.day,
                    timeSlot: `Akşam Yemeği - ${day.evening.time}`,
                    image: day.evening.dinner.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'
                });
            }
        });

        return places;
    }, [currentTripPlan]);

    // Harita merkezi (tüm yerlerin ortalaması)
    const mapCenter = useMemo<[number, number]>(() => {
        if (allPlaces.length === 0) return [41.0082, 28.9784]; // İstanbul default

        const avgLat = allPlaces.reduce((sum, p) => sum + p.lat, 0) / allPlaces.length;
        const avgLng = allPlaces.reduce((sum, p) => sum + p.lng, 0) / allPlaces.length;

        return [avgLat, avgLng];
    }, [allPlaces]);

    if (!currentTripPlan) {
        return null;
    }

    const { trip_summary, daily_itinerary, accommodation_suggestions, general_tips, packing_list } = currentTripPlan;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Navbar />

            <div className="container mx-auto px-4 py-24">
                {/* Trip Summary Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                        Ваш идеальный маршрут готов! 🎉
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-8 h-8 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-500">Направление</p>
                                <p className="font-semibold text-lg">{trip_summary.destination}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-500">Продолжительность</p>
                                <p className="font-semibold text-lg">{trip_summary.duration_days} дней</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-pink-500" />
                            <div>
                                <p className="text-sm text-gray-500">Путешественники</p>
                                <p className="font-semibold text-lg capitalize">{trip_summary.travelers}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <DollarSign className="w-8 h-8 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-500">Примерная стоимость</p>
                                <p className="font-semibold text-lg">{trip_summary.total_estimated_cost}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                        <Cloud className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold text-blue-900">Лучший сезон</p>
                            <p className="text-blue-700">{trip_summary.best_season}</p>
                            <p className="text-sm text-blue-600 mt-1">{trip_summary.weather_forecast}</p>
                        </div>
                    </div>
                </div>

                {/* HARITA - Tüm Aktiviteler */}
                {allPlaces.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">🗺️ Маршрут на карте</h2>
                        <div className="h-[500px] w-full rounded-xl overflow-hidden">
                            <MapContainer
                                center={mapCenter}
                                zoom={13}
                                className="h-full w-full"
                                zoomControl={true}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />

                                {allPlaces.map((place, index) => (
                                    <Marker
                                        key={place.id || index}
                                        position={[place.lat, place.lng]}
                                    >
                                        <Popup maxWidth={600} minWidth={450} className="custom-popup">
                                            <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-lg">
                                                {/* Görsel */}
                                                <div className="relative w-full h-48 overflow-hidden">
                                                    <img
                                                        src={place.image || "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800"}
                                                        alt={place.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop';
                                                        }}
                                                    />
                                                    {place.day && (
                                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                                            {place.day}. Gün
                                                        </div>
                                                    )}
                                                </div>

                                                {/* İçerik */}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                        {place.name}
                                                    </h3>

                                                    {place.timeSlot && (
                                                        <div className="text-sm text-gray-600 mb-3">
                                                            🕐 {place.timeSlot}
                                                        </div>
                                                    )}

                                                    {place.description && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                            {place.description}
                                                        </p>
                                                    )}

                                                    {place.address && (
                                                        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                                                            📍 {place.address}
                                                        </p>
                                                    )}

                                                    {/* Butonlar */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const query = encodeURIComponent(`${place.name}, ${place.address || ''}`);
                                                                const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                                                                window.open(url, "_blank");
                                                            }}
                                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                                                        >
                                                            Google Maps
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const url = `https://yandex.com/maps/?pt=${place.lng},${place.lat}&z=15`;
                                                                window.open(url, "_blank");
                                                            }}
                                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
                                                        >
                                                            Yandex Maps
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
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
                                <p className="text-gray-700">{general_tips.emergency_contacts}</p>
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
            </div>
        </div>
    );
}
