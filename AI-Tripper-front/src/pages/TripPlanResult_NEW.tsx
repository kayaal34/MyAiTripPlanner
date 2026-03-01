import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import TripMap from "../components/TripMap";
import { MapPin, Calendar, Users, DollarSign, Cloud, Coffee, UtensilsCrossed, Sun, Moon, Hotel, AlertCircle, Phone, MessageSquare, Package, Heart, X, ChevronDown, ChevronUp, Map } from "lucide-react";
import { saveTripToFavorites } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

// Accordion bileşeni
type AccordionProps = {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

function Accordion({ title, icon, children, defaultOpen = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 py-5 border-t border-gray-100">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TripPlanResult() {
    const navigate = useNavigate();
    const currentTripPlan = useTripStore((state) => state.currentTripPlan);
    const currentTripFormData = useTripStore((state) => state.currentTripFormData);
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
        if (!token || !currentTripPlan || !currentTripFormData) {
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
            await saveTripToFavorites(
                currentTripPlan,
                tripName,
                currentTripFormData.city,
                currentTripFormData.days,
                currentTripFormData.travelers,
                currentTripFormData.interests,
                currentTripFormData.budget,
                currentTripFormData.transport,
                token
            );
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

    const { trip_summary, daily_itinerary, accommodation_suggestions, general_tips, packing_list, country_flag } = currentTripPlan;

    // Harita için tüm aktivite lokasyonlarını topla
    const mapLocations: { name: string; lat: number; lng: number; description?: string }[] = [];
    
    daily_itinerary.forEach((day: any) => {
        // Sabah aktiviteleri
        if (day.morning?.activities) {
            day.morning.activities.forEach((activity: any) => {
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    mapLocations.push({
                        name: activity.name,
                        lat: activity.coordinates.lat,
                        lng: activity.coordinates.lng,
                        description: `${day.day}. Gün - Sabah`
                    });
                }
            });
        }

        // Öğle yemeği
        if (day.lunch?.restaurant?.coordinates?.lat && day.lunch?.restaurant?.coordinates?.lng) {
            mapLocations.push({
                name: day.lunch.restaurant.name,
                lat: day.lunch.restaurant.coordinates.lat,
                lng: day.lunch.restaurant.coordinates.lng,
                description: `${day.day}. Gün - Öğle Yemeği`
            });
        }

        // Öğleden sonra aktiviteleri
        if (day.afternoon?.activities) {
            day.afternoon.activities.forEach((activity: any) => {
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    mapLocations.push({
                        name: activity.name,
                        lat: activity.coordinates.lat,
                        lng: activity.coordinates.lng,
                        description: `${day.day}. Gün - Öğleden Sonra`
                    });
                }
            });
        }

        // Akşam yemeği
        if (day.evening?.dinner?.coordinates?.lat && day.evening?.dinner?.coordinates?.lng) {
            mapLocations.push({
                name: day.evening.dinner.name,
                lat: day.evening.dinner.coordinates.lat,
                lng: day.evening.dinner.coordinates.lng,
                description: `${day.day}. Gün - Akşam Yemeği`
            });
        }
    });

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
                {/* Header with Flag */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white"
                >
                    <div className="flex items-center gap-4 mb-6">
                        {country_flag && (
                            <img 
                                src={country_flag} 
                                alt="Country Flag" 
                                className="w-16 h-12 rounded-lg shadow-lg object-cover"
                            />
                        )}
                        <h1 className="text-4xl font-bold flex-1">
                            {trip_summary.destination} Rehberiniz Hazır! 🎉
                        </h1>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
                            <Calendar className="w-8 h-8" />
                            <div>
                                <p className="text-sm opacity-80">Süre</p>
                                <p className="font-bold text-lg">{trip_summary.duration_days} Gün</p>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
                            <Users className="w-8 h-8" />
                            <div>
                                <p className="text-sm opacity-80">Gezginler</p>
                                <p className="font-bold text-lg capitalize">{trip_summary.travelers}</p>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
                            <DollarSign className="w-8 h-8" />
                            <div>
                                <p className="text-sm opacity-80">Tahmini Bütçe</p>
                                <p className="font-bold text-lg">{trip_summary.total_estimated_cost}</p>
                            </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
                            <Cloud className="w-8 h-8" />
                            <div>
                                <p className="text-sm opacity-80">En İyi Sezon</p>
                                <p className="font-bold text-lg">{trip_summary.best_season}</p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    {user && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSaveModal(true)}
                            className="mt-6 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
                            Trip'i Kaydet
                        </motion.button>
                    )}
                </motion.div>

                {/* Hava Durumu */}
                {trip_summary.weather_forecast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl p-6 mb-8 text-white shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Cloud className="w-6 h-6" />
                            <h3 className="text-xl font-bold">Hava Durumu Tahmini</h3>
                        </div>
                        <p className="text-lg opacity-90">{trip_summary.weather_forecast}</p>
                    </motion.div>
                )}

                {/* Günlük Program - Accordion */}
                {daily_itinerary.map((day: any, dayIndex: number) => (
                    <Accordion
                        key={dayIndex}
                        title={`${day.day}. Gün: ${day.title || 'Program'}`}
                        icon={<Calendar className="w-6 h-6 text-blue-500" />}
                        defaultOpen={dayIndex === 0}
                    >
                        <div className="space-y-4">
                            {/* Sabah */}
                            {day.morning && day.morning.activities && day.morning.activities.length > 0 && (
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <h4 className="font-bold text-lg text-yellow-700 mb-3 flex items-center gap-2">
                                        <Coffee className="w-5 h-5" />
                                        Sabah ({day.morning.time})
                                    </h4>
                                    {day.morning.activities.map((activity: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-lg p-3 mb-2">
                                            <p className="font-semibold text-gray-800">{activity.name}</p>
                                            <p className="text-sm text-gray-600">{activity.duration} • {activity.cost}</p>
                                            <p className="text-sm text-gray-500 mt-1">📍 {activity.address}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Öğle */}
                            {day.lunch && day.lunch.restaurant && (
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-bold text-lg text-orange-700 mb-3 flex items-center gap-2">
                                        <UtensilsCrossed className="w-5 h-5" />
                                        Öğle Yemeği ({day.lunch.time})
                                    </h4>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="font-semibold text-gray-800">{day.lunch.restaurant.name}</p>
                                        <p className="text-sm text-gray-600">{day.lunch.restaurant.cuisine} • {day.lunch.restaurant.average_cost}</p>
                                        <p className="text-sm text-gray-500 mt-1">📍 {day.lunch.restaurant.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Öğleden Sonra */}
                            {day.afternoon && day.afternoon.activities && day.afternoon.activities.length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-bold text-lg text-blue-700 mb-3 flex items-center gap-2">
                                        <Sun className="w-5 h-5" />
                                        Öğleden Sonra ({day.afternoon.time})
                                    </h4>
                                    {day.afternoon.activities.map((activity: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-lg p-3 mb-2">
                                            <p className="font-semibold text-gray-800">{activity.name}</p>
                                            <p className="text-sm text-gray-600">{activity.duration} • {activity.cost}</p>
                                            <p className="text-sm text-gray-500 mt-1">📍 {activity.address}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Akşam */}
                            {day.evening && day.evening.dinner && (
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h4 className="font-bold text-lg text-purple-700 mb-3 flex items-center gap-2">
                                        <Moon className="w-5 h-5" />
                                        Akşam ({day.evening.time})
                                    </h4>
                                    <div className="bg-white rounded-lg p-3">
                                        <p className="font-semibold text-gray-800">{day.evening.dinner.name}</p>
                                        <p className="text-sm text-gray-600">{day.evening.dinner.cuisine} • {day.evening.dinner.average_cost}</p>
                                        <p className="text-sm text-gray-500 mt-1">📍 {day.evening.dinner.address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Günlük Bütçe */}
                            {day.daily_tips && day.daily_tips.estimated_daily_budget && (
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-sm font-semibold text-green-700">
                                        💰 Günlük Tahmini Bütçe: {day.daily_tips.estimated_daily_budget}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Accordion>
                ))}

                {/* Konaklama - Accordion */}
                <Accordion 
                    title="🏨 Konaklama Önerileri" 
                    icon={<Hotel className="w-6 h-6 text-purple-500" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accommodation_suggestions.map((acc: any, idx: number) => (
                            <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                                <h4 className="font-bold text-lg text-gray-800 mb-2">{acc.name}</h4>
                                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {acc.location}
                                </p>
                                <p className="font-bold text-green-600 text-lg mb-2">{acc.price_range}</p>
                                <p className="text-sm text-gray-700">{acc.why_recommended || acc.description}</p>
                            </div>
                        ))}
                    </div>
                </Accordion>

                {/* Genel İpuçları - Accordion */}
                <Accordion 
                    title="💡 Genel İpuçları" 
                    icon={<AlertCircle className="w-6 h-6 text-yellow-500" />}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-xl p-5">
                            <h4 className="font-bold text-lg text-blue-600 mb-3">🏛️ Yerel Gelenekler</h4>
                            <p className="text-gray-700 text-sm">{general_tips.local_customs}</p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-5">
                            <h4 className="font-bold text-lg text-green-600 mb-3">🛡️ Güvenlik</h4>
                            <p className="text-gray-700 text-sm">{general_tips.safety}</p>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-5">
                            <h4 className="font-bold text-lg text-yellow-600 mb-3">💵 Para ve Ödeme</h4>
                            <p className="text-gray-700 text-sm">{general_tips.money}</p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-5">
                            <h4 className="font-bold text-lg text-red-600 mb-3 flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Acil Durum İletişim
                            </h4>
                            <p className="text-gray-700 text-sm">{general_tips.emergency_contacts}</p>
                        </div>
                    </div>

                    {general_tips.useful_phrases && general_tips.useful_phrases.length > 0 && (
                        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
                            <h4 className="font-bold text-lg text-purple-600 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Faydalı İfadeler
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {general_tips.useful_phrases.map((phrase: string, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg px-3 py-2 text-sm">
                                        {phrase}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Accordion>

                {/* Bavul Listesi - Accordion */}
                <Accordion 
                    title="🎒 Bavul Hazırlık Listesi" 
                    icon={<Package className="w-6 h-6 text-pink-500" />}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {packing_list.map((item: string, index: number) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3 border-2 border-pink-100 text-center"
                            >
                                <p className="text-sm font-semibold text-gray-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </Accordion>

                {/* İnteraktif Harita */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mt-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Map className="w-6 h-6 text-blue-500" />
                        <h3 className="text-2xl font-bold text-gray-800">📍 Rota Haritası</h3>
                        <span className="ml-auto text-sm text-gray-500">
                            Kırmızı pinler ziyaret noktalarını gösteriyor
                        </span>
                    </div>
                    <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-200">
                        <TripMap 
                            cityName={currentTripFormData?.city || trip_summary.destination}
                            locations={mapLocations}
                        />
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
                    >
                        Yeni Plan Oluştur
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Yazdır / PDF Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}
