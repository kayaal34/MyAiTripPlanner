import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { Mail, Lock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [newEmail, setNewEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!user) {
        navigate("/");
        return null;
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
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
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement delete account
            logout();
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 px-6">
            <Navbar />
            <div className="max-w-4xl mx-auto mt-24">
                <Breadcrumb items={[
                    { label: "Hesabım", path: "/profile" },
                    { label: "Hesap Ayarları" }
                ]} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Hesap Ayarları</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Email Değiştir */}
                    <div className="mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-semibold text-gray-800">E-posta Adresi</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mevcut E-posta
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni E-posta
                                </label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled
                                />
                                <p className="text-sm text-gray-500 mt-2">Bu özellik yakında eklenecek</p>
                            </div>
                        </div>
                    </div>

                    {/* Şifre Değiştir */}
                    <div className="mb-8 pb-8 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="w-5 h-5 text-purple-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Şifre Değiştir</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mevcut Şifre
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Şifre
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yeni Şifre (Tekrar)
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                            >
                                Şifreyi Güncelle
                            </button>
                        </div>
                    </div>

                    {/* Hesabı Sil */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl font-semibold text-gray-800">Tehlikeli Bölge</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Hesabınızı kalıcı olarak silmek istiyorsanız, bu özelliği kullanabilirsiniz.
                            Bu işlem geri alınamaz.
                        </p>
                        {showDeleteConfirm && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-700 font-semibold mb-3">
                                    ⚠️ Hesabınızı silmek istediğinize emin misiniz?
                                </p>
                                <p className="text-sm text-red-600">
                                    Tüm verileriniz kalıcı olarak silinecektir.
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className={`px-6 py-3 ${showDeleteConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded-xl font-semibold transition-all disabled:opacity-50`}
                            >
                                {showDeleteConfirm ? "Evet, Hesabımı Sil" : "Hesabı Sil"}
                            </button>
                            {showDeleteConfirm && (
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    İptal
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
