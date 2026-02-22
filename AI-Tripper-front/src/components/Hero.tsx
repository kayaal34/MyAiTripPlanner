import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

interface HeroProps {
    onAuthClick: () => void;
}

export default function Hero({ onAuthClick }: HeroProps) {
    const [bgImage, setBgImage] = useState<string>("");
    const [shrink, setShrink] = useState(false);
    const [currentWord, setCurrentWord] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const words = ["Приключениях", "Гастрономии", "Культуре", "Природе", "Городах", "Море", "Горах"];
    
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();

    // 🔥 Dinamik kelime değişimi
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // 🔥 Scroll shrink effect
    useEffect(() => {
        const handleScroll = () => {
            setShrink(window.scrollY > 80);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 🔥 Unsplash'tan net fotoğraf çek
    useEffect(() => {
        const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

        fetch(
            `https://api.unsplash.com/photos/random?query=travel,nature,city,landscape&orientation=landscape&client_id=${key}`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data?.urls?.full) {
                    setBgImage(data.urls.full); // en net çözünürlük
                }
            })
            .catch(() => {
                setBgImage("https://images.unsplash.com/photo-1507525428034-b723cf961d3e");
            });
    }, []);

    return (
        <div className="relative w-full h-[100vh] overflow-hidden">

            {/* 🔥 Shrinking Navbar */}
            <motion.div
                animate={{
                    height: shrink ? 70 : 110,
                    backgroundColor: shrink ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
                    backdropFilter: shrink ? "blur(12px)" : "blur(8px)",
                }}
                className="fixed top-0 left-0 w-full flex items-center justify-between px-8 z-50 shadow-lg transition-all"
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
                        ) : (
                            <button
                                onClick={onAuthClick}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Вход
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 🔥 Background image */}
            <motion.img
                key={bgImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.8 }}
                src={bgImage}
                className="absolute inset-0 w-full h-full object-cover"
                alt="travel background"
            />

            {/* 🔥 Slight overlay */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* 🔥 Center animated text */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <div className="bg-black/40 px-6 py-4 rounded-2xl backdrop-blur-sm">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white">
                        Отпуск Вашей Мечты о{" "}
                        <motion.span
                            key={currentWord}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-blue-400"
                        >
                            {words[currentWord]}
                        </motion.span>
                    </h1>
                    <p className="text-2xl mt-2 text-white font-semibold">
                        Спланируйте за Секунды ✈️🌍
                    </p>
                </div>

            </motion.div>

        </div>
    );
}
