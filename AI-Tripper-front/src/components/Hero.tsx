import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Hero() {
    const [bgImage, setBgImage] = useState<string>("");

    const [shrink, setShrink] = useState(false);

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
                    backgroundColor: shrink ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0)",
                    backdropFilter: shrink ? "blur(12px)" : "blur(0px)",
                }}
                className="fixed top-0 left-0 w-full flex items-center justify-center z-50 shadow-sm transition-all"
            >
                <h1 className="text-3xl font-extrabold text-gray-800 flex gap-2">
                    AI Trip Planner <span className="text-4xl"></span>
                </h1>
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
                    <h1 className="text-6xl md:text-7xl font-extrabold text-white">
                        Plan Your Dream Trip
                    </h1>
                    <p className="text-xl mt-2 text-white">
                        AI-powered smart itinerary generation ✈️🌍
                    </p>
                </div>

            </motion.div>

        </div>
    );
}
