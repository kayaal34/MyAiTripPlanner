import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { ArrowLeft, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    if (!user) {
        navigate("/");
        return null;
    }

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
                    className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Hesap Ayarları</h1>
                            <p className="text-gray-500">Şifre ve e-posta yönetimi yakında ekleniyor.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                        <p className="text-sm font-medium text-gray-700">Mevcut hesap</p>
                        <p className="mt-2 text-lg text-gray-900">{user.email}</p>
                        <p className="mt-2 text-sm text-gray-500">
                            Bu sayfa şu an yalnızca bilgi amaçlıdır. Hesap silme ve kimlik bilgisi güncelleme akışı aktif değil.
                        </p>
                    </div>

                    <div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate("/profile")}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Profile Dön
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black"
                            >
                                <LogOut className="h-4 w-4" />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
