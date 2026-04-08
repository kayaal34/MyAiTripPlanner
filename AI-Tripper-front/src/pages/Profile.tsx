import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { MapPin, Compass, Settings, LogOut, Clock } from "lucide-react";

export default function Profile() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

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

                {/* Account Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
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
                </motion.div>
            </div>
        </div>
    );
}
