import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getRouteHistory, type RouteHistoryResponse } from "../services/api";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Clock, MapPin, Calendar, Loader2 } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 px-6">
            <Navbar />
            <div className="max-w-6xl mx-auto mt-24">
                <Breadcrumb items={[
                    { label: "Hesabım", path: "/profile" },
                    { label: "Hareketlerim" }
                ]} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-8 h-8 text-indigo-500" />
                        <h1 className="text-4xl font-bold text-gray-800">Hareketlerim</h1>
                    </div>
                    <p className="text-gray-600 mb-8">
                        Son oluşturduğunuz tüm tatil planları burada
                    </p>

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-700 mb-2">
                                Henüz Hareket Yok
                            </h2>
                            <p className="text-gray-500 mb-6">
                                İlk tatil planınızı oluşturduğunuzda burada görünecek
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Plan Oluştur
                            </button>
                        </div>
                    )}

                    {!loading && !error && history.length > 0 && (
                        <div className="space-y-4">
                            {history.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{item.city}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.interests.join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
