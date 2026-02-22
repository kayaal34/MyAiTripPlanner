import RouteForm from "../components/RouteForm";
import { useState } from "react";
import SocialTiles from "../components/SocialTiles";
import Hero from "../components/Hero";
import FAQ from "../components/FAQ";
import PopularDestinations from "../components/PopularDestinations";
import AuthModal from "../components/AuthModal";
import MapView from "../components/MapView";

export default function Home() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex flex-col items-center">
            {/* 🔥 HERO BÖLÜMÜ */}
            <Hero onAuthClick={() => setShowAuthModal(true)} />

            {/* 🚀 ROTA PLANLAMA FORMU - ESKİ DÜZENİ GİBİ EN BAŞTA */}
            <div className="w-full max-w-4xl mx-auto mt-20 px-6">
                <RouteForm />
            </div>

            {/* 🗺️ HARITA VE RASTGELE ÜNLÜ YERLER */}
            <div className="w-full max-w-7xl mx-auto px-6 py-16">
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold text-[#1e3a8a] mb-3">
                        Откройте для себя известные места
                    </h2>
                    <p className="text-lg text-gray-600">
                        Нажмите на кнопку, чтобы увидеть случайное туристическое место
                    </p>
                </div>
                <MapView />
            </div>

            {/* 🌟 POPÜLER DESTİNASYONLAR */}
            <PopularDestinations />

            {/* ❓ SSS */}
            <FAQ />

            {/* 📱 SOSYAL MEDYA */}
            <SocialTiles />

            {/* 🔐 AUTH MODAL */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
        </div>
    );
}
