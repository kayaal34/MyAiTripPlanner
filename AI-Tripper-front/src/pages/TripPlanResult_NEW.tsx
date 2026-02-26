import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import { MapPin, Calendar, Users, DollarSign, Cloud, Coffee, UtensilsCrossed, Sun, Moon, Info, Hotel, AlertCircle, Phone, MessageSquare, Package, Heart, X } from "lucide-react";
import { saveTripToFavorites } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function TripPlanResult() {
    const navigate = useNavigate();
    const currentTripPlan = useTripStore((state) => state.currentTripPlan);
    const currentTripId = useTripStore((state) => state.currentTripId);
    const { user, token } = useAuthStore();
    
    // Save modal state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [tripName, setTripName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Eğer plan yoksa ana sayfaya yönlendir
    useEffect(() => {
        if (!currentTripPlan) {
            navigate("/");
        }
    }, [currentTripPlan, navigate]);

    // Trip kaydetme fonksiyonu
    const handleSaveTrip = async () => {
        if (!token || !currentTripId) {
            setSaveError("Lütfen giriş yapın");
            return;
        }

        if (!tripName.trim()) {
            setSaveError("Lütfen trip'e bir isim verin");
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            await saveTripToFavorites(currentTripId, tripName, token);
            setSaveSuccess(true);
            setTimeout(() => {
                setShowSaveModal(false);
                setSaveSuccess(false);
                setTripName("");
            }, 1500);
        } catch (error) {
            console.error("Save error:", error);
            setSaveError("Trip kaydedilemedi. Lütfen tekrar deneyin.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!currentTripPlan) {
        return null;
    }

    const { trip_summary, daily_itinerary, accommodation_suggestions, general_tips, packing_list } = currentTripPlan;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Navbar />
            
            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSaveModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">Trip'i Kaydet</h3>
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                           </div>

                            {saveSuccess ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-8 h-8 text-green-600 fill-current" />
                                    </div>
                                    <p className="text-xl font-semibold text-green-600">
                                        Trip başarıyla kaydedildi!
                                    </p>
                                 </motion.div>
                            ) : (
                               <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Trip İsmi
                                        </label>
                                        <input
                                            type="text"
                                            value={tripName}
                                            onChange={(e) => setTripName(e.target.value)}
                                            placeholder="Örnek: Paris 5 günlük tatil"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            autoFocus
                                        />
                                    </div>

                                    {saveError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                                        >
                                            {saveError}
                                        </motion.div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowSaveModal(false)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                            disabled={isSaving}
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleSaveTrip}
                                            disabled={isSaving}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? "Kaydediliyor..." : "Kaydet"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
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

                {/* Daily Itinerary */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">📅 Ежедневный маршрут</h2>
                    
                    {daily_itinerary.map((day: any) => (
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
                                        {day.morning.activities.map((activity: any, idx: number) => (
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
                                        {day.afternoon.activities.map((activity: any, idx: number) => (
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
                                                {day.evening.night_activities.map((activity: string, idx: number) => (
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
                        {accommodation_suggestions.map((acc: any, idx: number) => (
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
                                {general_tips.useful_phrases.map((phrase: string, idx: number) => (
                                    <p key={idx} className="text-sm text-gray-700">• {phrase}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Packing List */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="w-8 h-8 text-purple-600" />
                        <h2 className="text-3xl font-bold text-gray-800">🎒 Что взять с собой</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {packing_list.map((item: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <p className="text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    {user && token && currentTripId && (
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
                            Favorilere Kaydet
                        </button>
                    )}
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
