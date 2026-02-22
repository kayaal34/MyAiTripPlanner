import RouteForm from "../components/RouteForm";
import { useState } from "react";
import SocialTiles from "../components/SocialTiles";
import Hero from "../components/Hero";
import FAQ from "../components/FAQ";
import PopularDestinations from "../components/PopularDestinations";
import AuthModal from "../components/AuthModal";

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
