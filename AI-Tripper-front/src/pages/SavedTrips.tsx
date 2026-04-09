import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTripStore } from "../store/useTripStore";
import { getSavedTrips, deleteSavedTrip, type SavedTripResponse } from "../services/api";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Heart, Calendar, MapPin, Users, Trash2, Eye, Loader2, DollarSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SavedTrips() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const setCurrentTripPlan = useTripStore((state) => state.setCurrentTripPlan);
    const setCurrentTripFormData = useTripStore((state) => state.setCurrentTripFormData);

    const [trips, setTrips] = useState<SavedTripResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Load saved trips
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        loadSavedTrips();
    }, [token, navigate]);

    const loadSavedTrips = async () => {
        if (!token) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getSavedTrips(token);
            setTrips(data);
        } catch (err: any) {
            console.error("Error loading saved trips:", err);
            setError(err.message || "Kayıtlı rotalar yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    const handleViewTrip = (trip: SavedTripResponse) => {
        // Set the trip plan in store and navigate to result page
        setCurrentTripPlan(trip.trip_plan);
        setCurrentTripFormData({
            city: trip.city,
            days: trip.duration_days,
            travelers: trip.travelers,
            interests: trip.interests,
            budget: trip.budget || "orta",
            transport: trip.transport || "farketmez"
        });
        navigate("/trip-plan");
    };

    const handleDeleteTrip = async (tripId: number) => {
        if (!token) return;
        
        if (!confirm("Bu rotayı silmek istediğinize emin misiniz?")) {
            return;
        }

        setDeletingId(tripId);

        try {
            await deleteSavedTrip(tripId, token);
            setTrips(trips.filter((t) => t.id !== tripId));
        } catch (err: any) {
            console.error("Error deleting trip:", err);
            alert("Rota silinemedi: " + (err.message || "Bilinmeyen hata"));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
                <Breadcrumb items={[{ label: "Kayıtlı Rotalarım" }]} />
                
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-8 h-8 text-orange-500 fill-orange-500 drop-shadow-sm" />
                        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Kayıtlı Rotalarım</h1>
                    </div>
                    <p className="text-gray-500 ml-11 font-medium">
                        Favori tatil planlarınız burada güvenle saklanıyor
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-sm"
                    >
                        <p className="text-red-700 font-bold mb-4">{error}</p>
                        <button
                            onClick={loadSavedTrips}
                            className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Tekrar Dene
                        </button>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && !error && trips.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center max-w-lg mx-auto"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Henüz Kayıtlı Rota Yok
                        </h2>
                        <p className="text-gray-500 mb-8 font-medium">
                            Yeni bir tatil planı oluşturup kaydettiğinizde tam olarak burada görünecek.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
                        >
                            Yeni Plan Oluştur
                        </button>
                    </motion.div>
                )}

                {/* Trips Grid */}
                {!loading && !error && trips.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip, index) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-500/30 transition-all duration-300 group flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="bg-gray-50/80 border-b border-gray-100 p-6 flex flex-col gap-1.5 relative overflow-hidden">
                                    <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors z-10 relative pr-6">
                                        {trip.name || `${trip.city} Gezisi`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider z-10 relative">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(trip.created_at).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                                        <MapPin className="w-24 h-24 text-orange-600 -mt-6 -mr-4" />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-4 mb-6 flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-orange-50 rounded-lg shrink-0 mt-0.5">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <span className="font-bold text-gray-800 pt-1.5 leading-tight">{trip.city}{trip.country && `, ${trip.country}`}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <span className="font-semibold text-gray-600">{trip.duration_days} Gün</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                                <Users className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <span className="capitalize font-semibold text-gray-600">{trip.travelers}</span>
                                        </div>
                                        {trip.budget && (
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <span className="capitalize font-semibold text-gray-600">{trip.budget} Bütçe</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Interests Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {trip.interests.slice(0, 3).map((interest, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-bold border border-gray-200"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                        {trip.interests.length > 3 && (
                                            <span className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-400 text-xs rounded-lg font-bold">
                                                +{trip.interests.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto">
                                        <button
                                            onClick={() => handleViewTrip(trip)}
                                            className="flex-[3] flex items-center justify-center gap-2 px-4 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-orange-200 hover:text-orange-600 transition-all shadow-sm group-hover:border-orange-100"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Görüntüle</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTrip(trip.id)}
                                            disabled={deletingId === trip.id}
                                            className="flex-1 flex items-center justify-center px-4 py-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            title="Sil"
                                        >
                                            {deletingId === trip.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
