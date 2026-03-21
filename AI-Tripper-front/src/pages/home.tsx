import RouteForm from "../components/RouteForm";
import { useState, useEffect, useRef } from "react";
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
    const plannerSectionRef = useRef<HTMLDivElement | null>(null);
    const { token, updateUser, isAuthenticated } = useAuthStore();

    // Ana sayfaya ilk girişte kullanıcıyı plan formuna otomatik indir
    useEffect(() => {
        const storageKey = "homeAutoScrolledToPlanner";
        const alreadyScrolled = sessionStorage.getItem(storageKey);

        if (alreadyScrolled) {
            return;
        }

        let animationFrameId = 0;

        const animateScroll = (targetY: number, durationMs: number) => {
            const startY = window.scrollY;
            const distance = targetY - startY;
            const startTime = performance.now();

            const easeInOutCubic = (t: number) =>
                t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            const step = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / durationMs, 1);
                const easedProgress = easeInOutCubic(progress);

                window.scrollTo(0, startY + distance * easedProgress);

                if (progress < 1) {
                    animationFrameId = window.requestAnimationFrame(step);
                }
            };

            animationFrameId = window.requestAnimationFrame(step);
        };

        const timer = window.setTimeout(() => {
            const targetTop = plannerSectionRef.current?.offsetTop;
            if (typeof targetTop !== "number") return;

            // Navbar yüksekliğini hesaba katıp daha doğal bir bitiş noktası seç
            const finalY = Math.max(0, targetTop - 90);
            animateScroll(finalY, 1800);
            sessionStorage.setItem(storageKey, "1");
        }, 1100);

        return () => {
            window.clearTimeout(timer);
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

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
            <div ref={plannerSectionRef} className="w-full max-w-4xl mx-auto mt-20 px-6">
                <RouteForm />
            </div>

            {/* 📝 BİLGİLENDİRME METNİ */}
            <section className="w-full max-w-5xl mx-auto px-6 py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 text-[#1f2937]">
                    <h2 className="text-4xl md:text-5xl font-display font-semibold leading-tight mb-6">
                        Mükemmel Tatil Planı Nasıl Yapılır?
                        <br />
                        Yapay Zeka Destekli Rehberiniz
                    </h2>

                    <p className="text-lg leading-8 text-gray-600 mb-8">
                        Hayalinizdeki tatile çıkmak heyecan verici olsa da tatil planlama süreci çoğu zaman karmaşık olabilir.
                        Otel, rota, restoran ve aktivite seçimi arasında kaybolmamak için akıllı bir plan şarttır.
                        Modern tatil planlayıcı yaklaşımı ile tüm süreci daha hızlı, daha net ve daha keyifli hale getirebilirsiniz.
                    </p>

                    <h3 className="text-3xl font-display font-semibold mb-4">Adım Adım Kusursuz Tatil Planı</h3>
                    <ol className="list-decimal list-inside space-y-4 text-lg text-gray-700 leading-8 mb-8">
                        <li><span className="font-semibold">Hayal Kurun ve Karar Verin:</span> Tatilinizi kültür, doğa, deniz veya gastronomi temasıyla netleştirin.</li>
                        <li><span className="font-semibold">Bütçe ve Süreyi Belirleyin:</span> Gün sayısına göre ulaşım, konaklama ve günlük harcama dengesini oluşturun.</li>
                        <li><span className="font-semibold">Rota ve Aktiviteleri Planlayın:</span> Görülecek yerleri gün bazında gruplayarak zaman kaybını azaltın.</li>
                        <li><span className="font-semibold">Rezervasyonları Tamamlayın:</span> Uçak, otel ve popüler etkinlikleri erken ayarlayarak avantaj sağlayın.</li>
                    </ol>

                    <h3 className="text-3xl font-display font-semibold mb-4">Geleceğin Çözümü: Tatil Planı Yapay Zeka Teknolojisi</h3>
                    <p className="text-lg leading-8 text-gray-600 mb-6">
                        Tatil planlama uygulamamız; şehir seçimi, bütçe, ilgi alanı ve gün sayınızı analiz ederek size özel bir rota önerir.
                        Böylece saatler süren araştırma yerine dakikalar içinde uygulanabilir bir plan elde edersiniz.
                    </p>

                    <blockquote className="border-l-4 border-gray-200 pl-4 italic text-2xl leading-10 text-gray-800 mb-8">
                        "İyi bir tatil planı, tatilin kendisi kadar keyifli olmalı. Akıllı planlama ile yükünüz azalır,
                        size sadece seyahatin tadını çıkarmak kalır."
                    </blockquote>

                    <h3 className="text-3xl font-display font-semibold mb-4">İlham Veren Tatil Planı Örnekleri</h3>
                    <ul className="space-y-4 text-lg text-gray-700 leading-8">
                        <li><span className="font-semibold">3 Günlük Kapadokya Planı:</span> Balon turu, Göreme hattı ve yerel lezzetlerle kısa ama dolu bir rota.</li>
                        <li><span className="font-semibold">1 Haftalık Ege Planı:</span> İzmir, Çeşme, Alaçatı, Bodrum çizgisinde deniz ve tarih dengesini kuran program.</li>
                    </ul>
                </div>
            </section>

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
