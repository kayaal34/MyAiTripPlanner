import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface NavbarProps {
    onAuthClick?: () => void;
    transparent?: boolean;
}

export default function Navbar({ onAuthClick, transparent = false }: NavbarProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-8 z-50 shadow-lg transition-all h-20 ${
                transparent 
                    ? "bg-white/95 backdrop-blur-md" 
                    : "bg-white"
            }`}
        >
            <h1 
                onClick={() => navigate("/")}
                className="text-3xl font-extrabold text-gray-800 flex gap-2 cursor-pointer hover:text-blue-600 transition"
            >
                AI Trip Planner <span className="text-4xl">✈️</span>
            </h1>

            {/* Navigation Menu */}
            <div className="flex items-center gap-8">
                <button
                    onClick={() => navigate("/")}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                    Главная
                </button>

                {/* Kurumsal Dropdown */}
                <div 
                    className="relative"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 py-2">
                        Корпоративный
                        <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 pt-2 w-48"
                        >
                            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                                <button
                                    onClick={() => navigate("/about")}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    О Нас
                                </button>
                                <button
                                    onClick={() => navigate("/contact")}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors border-t"
                                >
                                    Связаться с Нами
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <>
                            <button
                                onClick={() => navigate("/profile")}
                                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                <User className="w-4 h-4" />
                                Профиль
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Выход
                            </button>
                        </>
                    ) : onAuthClick ? (
                        <button
                            onClick={onAuthClick}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            <LogIn className="w-4 h-4" />
                            Вход
                        </button>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}
