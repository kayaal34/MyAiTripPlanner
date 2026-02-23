import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

interface HeroProps {
    onAuthClick: () => void;
}

export default function Hero({ onAuthClick }: HeroProps) {
    const [bgImage, setBgImage] = useState<string>("");
    const [currentWord, setCurrentWord] = useState(0);
    
    const words = ["Приключениях", "Гастрономии", "Культуре", "Природе", "Городах", "Море", "Горах"];
    
    const navigate = useNavigate();

    // 🔥 Dinamik kelime değişimi
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
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
            
            {/* Navbar */}
            <Navbar onAuthClick={onAuthClick} transparent={true} />

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
            <div className="absolute inset-0 bg-black/40"></div>

            {/* 🔥 Center animated text */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <div className="bg-black/30 px-8 py-6 rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-3 leading-tight drop-shadow-lg">
                        Отпуск Вашей Мечты о{" "}
                        <motion.span
                            key={currentWord}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-yellow-300 drop-shadow-lg"
                        >
                            {words[currentWord]}
                        </motion.span>
                    </h1>
                    <p className="text-2xl md:text-3xl mt-3 text-white font-medium drop-shadow-lg">
                        Спланируйте за Секунды
                    </p>
                </div>

            </motion.div>

        </div>
    );
}
