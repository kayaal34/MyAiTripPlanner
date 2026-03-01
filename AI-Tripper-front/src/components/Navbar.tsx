import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Settings, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface NavbarProps {
    onAuthClick?: () => void;
    transparent?: boolean;
}

export default function Navbar({ onAuthClick, transparent = false }: NavbarProps) {
    const [showKurumsalDropdown, setShowKurumsalDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-12 z-50 shadow-sm transition-all h-20 ${
                transparent 
                    ? "bg-white/90 backdrop-blur-xl" 
                    : "bg-white/95 backdrop-blur-xl"
            }`}
        >
            {/* Logo - Left */}
            <div 
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            >
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-display font-bold text-gray-800 group-hover:text-blue-600 transition-all">
                    tatilplanlama
                </h1>
            </div>

            {/* Navigation Menu - Center */}
            <div className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                <button
                    onClick={() => navigate("/")}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-[15px]"
                >
                    Ana Sayfa
                </button>

                <button
                    onClick={() => navigate("/")}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-[15px]"
                >
                    Tatil Planları
                </button>

                <button
                    onClick={() => navigate("/")}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-[15px]"
                >
                    Tatil Şehirleri
                </button>

                {/* Kurumsal Dropdown */}
                <div 
                    className="relative"
                    onMouseEnter={() => setShowKurumsalDropdown(true)}
                    onMouseLeave={() => setShowKurumsalDropdown(false)}
                >
                    <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 text-[15px]">
                        Kurumsal
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
                            <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                <button
                                    onClick={() => navigate("/about")}
                                    className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all font-medium text-[15px]"
                                >
                                    О Нас
                                </button>
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all border-t border-gray-100 font-medium text-[15px]"
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
                    <div 
                        className="relative"
                        onMouseEnter={() => setShowUserDropdown(true)}
                        onMouseLeave={() => setShowUserDropdown(false)}
                    >
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-gray-700 font-medium transition-all flex items-center gap-2 border border-gray-200 text-[15px]">
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
                                <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowUserDropdown(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all font-medium flex items-center gap-3 text-[15px]"
                                    >
                                        <User className="w-4 h-4" />
                                        Hesabım
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate("/saved-trips");
                                            setShowUserDropdown(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all border-t border-gray-100 font-medium flex items-center gap-3 text-[15px]"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Kayıtlı Rotalarım
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setShowUserDropdown(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-blue-50/80 text-gray-700 hover:text-blue-600 transition-all border-t border-gray-100 font-medium flex items-center gap-3 text-[15px]"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Hesap Ayarlarım
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate("/");
                                            setShowUserDropdown(false);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all border-t border-gray-100 font-medium flex items-center gap-3 text-[15px]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Çıkış Yap
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : onAuthClick ? (
                    <button
                        onClick={onAuthClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-[15px]"
                    >
                        <LogIn className="w-4 h-4" />
                        Giriş
                    </button>
                ) : null}
            </div>
        </motion.div>
    );
}
