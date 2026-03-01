import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTripStore } from "../store/useTripStore";
import { getSavedTrips, deleteSavedTrip, type SavedTripResponse } from "../services/api";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Heart, Calendar, MapPin, Users, Trash2, Eye, Loader2, DollarSign } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
                <Breadcrumb items={[{ label: "Kayıtlı Rotalarım" }]} />
                
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                        <h1 className="text-4xl font-bold text-gray-800">Kayıtlı Rotalarım</h1>
                    </div>
                    <p className="text-gray-600 ml-11">
                        Favori tatil planlarınız burada saklanıyor
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
                    >
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={loadSavedTrips}
                            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            Henüz Kayıtlı Rota Yok
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Tatil planı oluşturup kaydettiğinizde burada görünecek
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1">
                                        {trip.name || `${trip.city} Gezisi`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm opacity-90">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(trip.created_at).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            <span className="font-medium">{trip.city}, {trip.country}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                            <span>{trip.duration_days} Gün</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Users className="w-5 h-5 text-pink-500 flex-shrink-0" />
                                            <span className="capitalize">{trip.travelers}</span>
                                        </div>
                                        {trip.budget && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <span className="capitalize">{trip.budget} Bütçe</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Interests Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {trip.interests.slice(0, 3).map((interest, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                        {trip.interests.length > 3 && (
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                                +{trip.interests.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleViewTrip(trip)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                        >
                                            <Eye className="w-5 h-5" />
                                            <span>Görüntüle</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTrip(trip.id)}
                                            disabled={deletingId === trip.id}
                                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
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
