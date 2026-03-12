import RouteForm from "../components/RouteForm";
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import SocialTiles from "../components/SocialTiles";
import Hero from "../components/Hero";
import FAQ from "../components/FAQ";
import PopularDestinations from "../components/PopularDestinations";
import AuthModal from "../components/AuthModal";
import MapView from "../components/MapView";
import { getCurrentUser } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

export default function Home() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { token, updateUser, isAuthenticated } = useAuthStore();

    // Pricing sayfasından gelen state'i kontrol et
    useEffect(() => {
        if (location.state?.openAuthModal) {
            setShowAuthModal(true);
            // State'i temizle
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Success sayfasından döndükten sonra kullanıcı bilgisini güncelle
    useEffect(() => {
        const fromSuccess = searchParams.get('from_payment');

        if (fromSuccess === 'success' && isAuthenticated && token) {
            console.log('💳 Ödeme başarılı! Kullanıcı bilgileri güncelleniyor...');

            // 3 saniye bekle (webhook işlensin)
            setTimeout(async () => {
                try {
                    const user = await getCurrentUser(token);
                    updateUser(user);
                    console.log('✅ Kullanıcı bilgileri güncellendi:', user);
                    console.log('🎉 Remaining routes:', user.remaining_routes);

                    // URL'den parametreyi temizle
                    searchParams.delete('from_payment');
                    window.history.replaceState({}, '', `/?${searchParams.toString()}`);

                    // Sayfayı yenile (localStorage güncellenmesini garanti et)
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } catch (error) {
                    console.error('❌ Kullanıcı bilgileri güncellenemedi:', error);
                }
            }, 3000);
        }
    }, [searchParams, isAuthenticated, token, updateUser]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center">
            {/* 🔥 HERO BÖLÜMÜ */}
            <Hero onAuthClick={() => setShowAuthModal(true)} />

            {/* 🚀 ROTA PLANLAMA FORMU - ESKİ DÜZENİ GİBİ EN BAŞTA */}
            <div className="w-full max-w-4xl mx-auto mt-20 px-6">
                <RouteForm />
            </div>

            {/* 🗺️ HARITA VE RASTGELE ÜNLÜ YERLER */}
            <div className="w-full max-w-7xl mx-auto px-6 py-16">
                <div className="mb-8 text-center">
                    <h2 className="text-5xl font-display font-bold text-gradient mb-4">
                        Откройте для себя известные места
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
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
