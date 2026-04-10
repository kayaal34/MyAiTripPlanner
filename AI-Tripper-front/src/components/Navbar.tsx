import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Heart, LogIn, LogOut, Map, RefreshCw, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { getCurrentUser } from "../services/api";
import logoImg from "../assets/logo.png";

interface NavbarProps {
    onAuthClick?: () => void;
    transparent?: boolean;
}

export default function Navbar({ onAuthClick, transparent = false }: NavbarProps) {
    const [showKurumsalDropdown, setShowKurumsalDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { isAuthenticated, user, logout, token, updateUser } = useAuthStore();
    const navigate = useNavigate();

    // Component mount olduğunda kullanıcı bilgisini bir kere güncelle
    useEffect(() => {
        const refreshUserData = async () => {
            if (isAuthenticated && token && user) {
                try {
                    const updatedUser = await getCurrentUser(token);
                    updateUser(updatedUser);
                    console.log('🔄 Navbar: Kullanıcı bilgisi güncellendi:', updatedUser.remaining_routes);
                } catch (error) {
                    console.error('⚠️ Kullanıcı bilgisi güncellenemedi:', error);
                }
            }
        };

        // Sadece component mount olduğunda çalışacak
        refreshUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Boş dependency array - sadece mount'ta çalışır

    // Manuel refresh fonksiyonu
    const handleManualRefresh = async () => {
        if (!isAuthenticated || !token) return;

        setIsRefreshing(true);
        try {
            const updatedUser = await getCurrentUser(token);
            updateUser(updatedUser);
            console.log('✅ Kullanıcı bilgisi manuel olarak güncellendi:', updatedUser.remaining_routes);
        } catch (error) {
            console.error('❌ Güncelleme hatası:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-12 z-50 transition-all duration-300 h-20 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-b border-gray-200/30 ${transparent
                ? "bg-gray-100/20 backdrop-blur-md"
                : "bg-gray-200/40 backdrop-blur-xl"
                }`}
        >
            {/* Logo - Left */}
            <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            >
                <div className="relative w-14 h-14 flex items-center justify-center transition-all group-hover:scale-105 overflow-hidden rounded-lg">
                    <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-display font-bold text-gray-800 group-hover:text-blue-600 transition-all">
                    mytripplanner
                </h1>
            </div>

            {/* Navigation Menu - Center */}
            <div className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                <button
                    onClick={() => navigate("/")}
                    className="text-gray-900 hover:text-blue-600 font-bold transition-colors text-[15px]"
                >
                    Главная страница
                </button>

                <button
                    onClick={() => navigate("/destinations")}
                    className="text-gray-900 hover:text-blue-600 font-bold transition-colors text-[15px]"
                >
                    Города отдыха
                </button>

                <button
                    onClick={() => navigate("/pricing")}
                    className="text-gray-900 hover:text-blue-600 font-bold transition-colors text-[15px] flex items-center gap-1.5"
                >
                    <span className="text-yellow-500"></span>
                    Подписки
                </button>

                {/* Kurumsal Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setShowKurumsalDropdown(true)}
                    onMouseLeave={() => setShowKurumsalDropdown(false)}
                >
                    <button className="text-gray-900 hover:text-blue-600 font-bold transition-colors flex items-center gap-1 text-[15px]">
                        Институциональный
                        <svg className={`w-3.5 h-3.5 transition-transform ${showKurumsalDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showKurumsalDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 pt-2 w-56"
                        >
                            <div className="bg-gray-100/60 backdrop-blur-2xl rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-200/50 overflow-hidden">
                                <button
                                    onClick={() => navigate("/about")}
                                    className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-900 hover:text-blue-600 transition-all font-bold text-[15px]"
                                >
                                    О Нас
                                </button>
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-900 hover:text-blue-600 transition-all border-t border-gray-100 font-bold text-[15px]"
                                >
                                    Связаться с Нами
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Auth Section - Right */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {isAuthenticated && user ? (
                    <>
                        {/* Kredi/Rota Göstergesi */}
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border ${user.remaining_routes === -1
                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700"
                                : user.remaining_routes === 0
                                    ? "bg-red-50 border-red-200 text-red-600"
                                    : "bg-blue-50 border-blue-200 text-blue-700"
                                }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                {user.remaining_routes === -1 ? (
                                    <span>∞ Sınırsız</span>
                                ) : user.remaining_routes === 0 ? (
                                    <span>0 Маршрут</span>
                                ) : (
                                    <span>{user.remaining_routes} Маршрут</span>
                                )}
                            </div>

                            {/* Manuel Yenile Butonu */}
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                                title="Rota sayısını yenile"
                            >
                                <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div
                            className="relative"
                            onMouseEnter={() => setShowUserDropdown(true)}
                            onMouseLeave={() => setShowUserDropdown(false)}
                        >
                            <button className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-gray-900 font-bold transition-all flex items-center gap-2 border border-gray-200 text-[15px]">
                                <User className="w-4 h-4" />
                                {user.username}
                                <svg className={`w-3.5 h-3.5 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {showUserDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full right-0 pt-2 w-56"
                                >
                                    <div className="bg-gray-100/60 backdrop-blur-2xl rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-200/50 overflow-hidden">
                                        <button
                                            onClick={() => {
                                                navigate("/history");
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all font-medium flex items-center gap-3 text-[15px]"
                                        >
                                            <Map className="w-4 h-4" />
                                            Мои поездки
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate("/saved-trips");
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all border-t border-gray-100 font-medium flex items-center gap-3 text-[15px]"
                                        >
                                            <Heart className="w-4 h-4" />
                                            Сохраненное
                                        </button>
                                        <div className="border-t border-gray-200/80 my-1" />
                                        <button
                                            onClick={() => {
                                                navigate("/profile", { state: { activeTab: "Мой аккаунт" } });
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all font-medium flex items-center gap-3 text-[15px]"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Настройки аккаунта
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate("/profile", { state: { activeTab: "Подписка" } });
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all font-medium flex items-center gap-3 text-[15px]"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Подписка
                                        </button>
                                        <div className="border-t border-gray-200/80 my-1" />
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate("/");
                                                setShowUserDropdown(false);
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all font-medium flex items-center gap-3 text-[15px]"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Выйти
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </>
                ) : onAuthClick ? (
                    <button
                        onClick={onAuthClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-[15px]"
                    >
                        <LogIn className="w-4 h-4" />
                        Войти
                    </button>
                ) : null}
            </div>
        </motion.div>
    );
}
