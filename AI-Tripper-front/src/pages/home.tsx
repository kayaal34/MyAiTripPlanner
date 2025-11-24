import MapView from "../components/MapView";
import RouteForm from "../components/RouteForm";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SocialTiles from "../components/SocialTiles";
import Hero from "../components/Hero";

export default function Home() {
    const [weather, setWeather] = useState<any[]>([]);
    const [popular, setPopular] = useState<any[]>([]);

    /* ------------------ HAVA DURUMU ------------------ */
    useEffect(() => {
        const cities = [
            { name: "İstanbul", lat: 41.0151, lon: 28.9795 },
            { name: "Ankara", lat: 39.9334, lon: 32.8597 },
            { name: "İzmir", lat: 38.4237, lon: 27.1428 },
            { name: "New York", lat: 40.7128, lon: -74.006 },
            { name: "Dubai", lat: 25.276987, lon: 55.296249 },
        ];

        Promise.all(
            cities.map((c) =>
                fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current_weather=true`
                ).then((res) => res.json())
            )
        ).then((data) => {
            setWeather(
                data.map((d, i) => ({
                    city: cities[i].name,
                    temp: d.current_weather.temperature,
                    wind: d.current_weather.windspeed,
                }))
            );
        });
    }, []);

    /* ------------------ POPÜLER YERLER ------------------ */
    useEffect(() => {
        fetch("http://localhost:8000/api/places")
            .then((res) => res.json())
            .then((data) => setPopular(data.results || []))
            .catch(() => {});
    }, []);

    /* ------------------ SAYFA ------------------ */
    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex flex-col items-center">

            {/* 🔥 SABİT SOSYAL MEDYA BUTONLARI */}
            <SocialTiles />

            {/* 🔥 HERO BÖLÜMÜ */}
            <Hero />

            {/* 🔥 FORM BÖLÜMÜ */}
            <div className="w-full max-w-3xl mt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white shadow-xl p-8 rounded-3xl border border-gray-200"
                >
                    <RouteForm />
                </motion.div>
            </div>

            {/* 🔥 HARİTA */}
            <div className="w-full max-w-5xl mt-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white shadow-xl p-4 rounded-3xl border border-gray-200"
                >
                    <MapView />
                </motion.div>
            </div>

            {/* 🔥 POPULAR PLACES */}
            <div className="w-full max-w-6xl px-8 mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    ⭐ Popular Places Nearby
                </h2>

                {popular.length === 0 ? (
                    <p className="text-gray-500">Loading places...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {popular.slice(0, 6).map((p, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.04 }}
                                className="bg-white rounded-2xl shadow p-5 border hover:shadow-lg transition"
                            >
                                <h3 className="font-semibold text-lg">{p.name}</h3>
                                <p className="text-gray-500 text-sm">{p.vicinity}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔥 WEATHER */}
            <div className="w-full max-w-6xl px-8 mt-20 mb-20">
                <h2 className="text-3xl font-bold mb-6">🌤️ Weather in Popular Cities</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {weather.map((w, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white rounded-3xl shadow p-6 text-center border"
                        >
                            <h3 className="font-bold text-xl">{w.city}</h3>
                            <p className="text-gray-500 mt-2 text-3xl">{w.temp}°C</p>
                            <p className="text-gray-400 text-sm">Wind: {w.wind} km/h</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
