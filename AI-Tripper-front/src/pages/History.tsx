import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getRouteHistory, type RouteHistoryResponse } from "../services/api";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Clock, MapPin, Calendar, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [history, setHistory] = useState<RouteHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const loadHistory = async () => {
            try {
                const data = await getRouteHistory(token);
                setHistory(data);
            } catch (err: any) {
                console.error("Failed to load history:", err);
                setError(err.message || "Geçmiş yüklenemedi");
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
                <Breadcrumb items={[
                    { label: "Hesabım", path: "/profile" },
                    { label: "Hareketlerim" }
                ]} />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-8 h-8 text-orange-500 drop-shadow-sm" />
                        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">Hareketlerim</h1>
                    </div>
                    <p className="text-gray-500 ml-11 font-medium">
                        Son oluşturduğunuz tüm tatil planları burada
                    </p>
                </motion.div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    </div>
                )}

                {error && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-sm"
                    >
                        <p className="text-red-700 font-bold mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Tekrar Dene
                        </button>
                    </motion.div>
                )}

                {!loading && !error && history.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center max-w-lg mx-auto"
                    >
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Henüz Hareket Yok
                        </h2>
                        <p className="text-gray-500 mb-8 font-medium">
                            İlk tatil planınızı oluşturduğunuzda burada görünecek.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-8 py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
                        >
                            Plan Oluştur
                        </button>
                    </motion.div>
                )}

                {!loading && !error && history.length > 0 && (
                    <div className="space-y-4">
                        {history.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-500/30 transition-all p-5 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                                                {item.city}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.interests.length > 0 ? item.interests.map((interest, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-md text-xs font-bold">
                                                        {interest}
                                                    </span>
                                                )) : (
                                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-md text-xs font-bold">
                                                        Belirtilmedi
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider md:pl-4 pl-16">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
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
