import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { 
    deleteAccount, 
    getRouteHistory,
    getSavedTrips,
    deleteSavedTrip,
    type SavedTripResponse
} from "../services/api";
import type { 
    RouteHistoryResponse
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart, Compass, Settings, LogOut, Mail, Lock, Trash2, Calendar, Users, DollarSign, Eye, Clock } from "lucide-react";

type TabType = "hesabim" | "planlarim" | "favorilerim" | "ayarlar";

export default function Profile() {
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<TabType>("hesabim");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routeHistory, setRouteHistory] = useState<RouteHistoryResponse[]>([]);
    const [savedTrips, setSavedTrips] = useState<SavedTripResponse[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Settings form states
    const [newEmail, setNewEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Load user routes
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const loadRoutes = async () => {
            try {
                const [history, trips] = await Promise.all([
                    getRouteHistory(token),
                    getSavedTrips(token)
                ]);
                setRouteHistory(history);
                setSavedTrips(trips);
            } catch (err) {
                console.error("Failed to load routes:", err);
            }
        };

        loadRoutes();
    }, [token, navigate]);

    const handleChangeEmail = async () => {
        if (!token || !newEmail) return;
        setError(null);
        setLoading(true);
        
        try {
            // TODO: Implement email change API call
            alert("E-posta değiştirme yakında eklenecek!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update email");
        } finally {
            setLoading(false);
        }
    };
    
    const handleChangePassword = async () => {
        if (!token || !currentPassword || !newPassword) {
            setError("Lütfen tüm alanları doldurun");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError("Yeni şifreler eşleşmiyor");
            return;
        }
        
        if (newPassword.length < 6) {
            setError("Yeni şifre en az 6 karakter olmalı");
            return;
        }
        
        setError(null);
        setLoading(true);
        
        try {
            // TODO: Implement password change API call
            alert("Şifre değiştirme yakında eklenecek!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!token) return;
        
        setLoading(true);
        try {
            await deleteAccount(token);
            logout();
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (tripId: number) => {
        if (!token) return;
        
        try {
            await deleteSavedTrip(tripId, token);
            // Listeyi güncelle
            setSavedTrips(savedTrips.filter(trip => trip.id !== tripId));
        } catch (err) {
            console.error("Failed to delete trip:", err);
            setError(err instanceof Error ? err.message : "Trip silinemedi");
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 px-6">
            <Navbar />
            <div className="max-w-6xl mx-auto mt-24">
                <Breadcrumb items={[{ label: "Hesabım" }]} />

                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{user.username}</h2>
                            <p className="text-gray-500 text-lg">{user.email}</p>
                        </div>
                    </div>

                    {/* Menu Header */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-600">Hesabım</h3>
                    </div>

                    {/* Card Menu Grid - 2x2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Planlarım */}
                        <button
                            onClick={() => navigate("/saved-trips")}
                            className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 rounded-2xl transition-all hover:shadow-lg border border-blue-200/50"
                        >
                            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Planlarım</span>
                        </button>

                        {/* Keşfet */}
                        <button
                            onClick={() => navigate("/destinations")}
                            className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100/50 hover:from-pink-100 hover:to-pink-200/50 rounded-2xl transition-all hover:shadow-lg border border-pink-200/50"
                        >
                            <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Compass className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Keşfet</span>
                        </button>

                        {/* Hesap Ayarlarım */}
                        <button
                            onClick={() => navigate("/settings")}
                            className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 rounded-2xl transition-all hover:shadow-lg border border-purple-200/50"
                        >
                            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Settings className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Hesap Ayarlarım</span>
                        </button>

                        {/* Hareketlerim */}
                        <button
                            onClick={() => navigate("/history")}
                            className="group flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200/50 rounded-2xl transition-all hover:shadow-lg border border-indigo-200/50"
                        >
                            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-800">Hareketlerim</span>
                        </button>
                    </div>

                    {/* Çıkış Yap Button */}
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-semibold text-lg"
                    >
                        <LogOut className="w-5 h-5" />
                        Çıkış Yap
                    </button>
                </motion.div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "hesabim" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Hesabım</h2>
                            
                            <div className="space-y-4">
                                {user.full_name && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Tam İsim</h3>
                                        <p className="text-lg text-gray-800">{user.full_name}</p>
                                    </div>
                                )}
                                
                                {user.bio && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Biyografi</h3>
                                        <p className="text-gray-700">{user.bio}</p>
                                    </div>
                                )}

                                {user.hobbies && user.hobbies.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Hobiler</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.hobbies.map((hobby, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                                >
                                                    {hobby}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user.interests && user.interests.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">İlgi Alanları</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.interests.map((interest, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "planlarim" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">🗺️ Planlarım</h2>

                            {routeHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Henüz planınız bulunmamaktadır
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {routeHistory.map((route) => (
                                        <div
                                            key={route.id}
                                            className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{route.city}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {route.stops} nokta • {route.mode}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {route.interests.map((interest, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                                            >
                                                                {interest}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(route.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "favorilerim" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">❤️ Kayıtlı Trip'lerim</h2>

                            {savedTrips.length === 0 ? (
                                <div className="text-center py-12">
                                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Henüz kayıtlı trip'iniz bulunmamaktadır</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Bir trip oluşturup "Favorilere Kaydet" butonuna tıklayın
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {savedTrips.map((trip) => (
                                        <motion.div
                                            key={trip.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
                                        >
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                                                <h3 className="font-bold text-xl mb-2">{trip.name}</h3>
                                                <p className="text-blue-100 text-sm">
                                                    {trip.city}, {trip.country}
                                                </p>
                                            </div>

                                            {/* Info */}
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-purple-500" />
                                                        <span className="text-gray-700">{trip.duration_days} gün</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-pink-500" />
                                                        <span className="text-gray-700 capitalize">{trip.travelers}</span>
                                                    </div>
                                                    {trip.budget && (
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-green-500" />
                                                            <span className="text-gray-700 capitalize">{trip.budget}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interests */}
                                                <div className="flex flex-wrap gap-2">
                                                    {trip.interests.map((interest, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                                        >
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Date */}
                                                <p className="text-xs text-gray-400">
                                                    Kaydedildi: {new Date(trip.created_at).toLocaleDateString('tr-TR')}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        onClick={() => handleViewTrip(trip)}
                                                        className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Görüntüle
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTrip(trip.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "ayarlar" && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Hesap Ayarları</h2>

                            {/* Email Change Section */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                    <h3 className="text-xl font-bold text-gray-800">E-posta Değiştir</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Mevcut e-posta: {user.email}</p>
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="Yeni e-posta adresi"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleChangeEmail}
                                        disabled={loading || newEmail === user.email}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Güncelleniyor..." : "E-posta'yı Güncelle"}
                                    </button>
                                </div>
                            </div>

                            {/* Password Change Section */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="w-6 h-6 text-purple-600" />
                                    <h3 className="text-xl font-bold text-gray-800">Şifre Değiştir</h3>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Mevcut şifre"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Yeni şifre"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Yeni şifre tekrar"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Güncelleniyor..." : "Şifre'yi Değiştir"}
                                    </button>
                                </div>
                            </div>

                            {/* Delete Account Section */}
                            <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                                <div className="flex items-center gap-3 mb-4">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                    <h3 className="text-xl font-bold text-red-800">Hesabı Kalıcı Olarak Sil</h3>
                                </div>
                                <p className="text-sm text-red-600 mb-4">
                                    ⚠️ Dikkat: Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                                </p>
                                
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition"
                                    >
                                        Hesabı Sil
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-red-700 font-semibold">
                                            Hesabınızı silmek istediğinizden emin misiniz?
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={loading}
                                                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl transition disabled:opacity-50"
                                            >
                                                {loading ? "Siliniyor..." : "Evet, Hesabımı Sil"}
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
