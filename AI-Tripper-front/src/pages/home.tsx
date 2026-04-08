import RouteForm from "../components/RouteForm";
import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import SocialTiles from "../components/SocialTiles";
import FAQ from "../components/FAQ";
import AuthModal from "../components/AuthModal";
import MapView from "../components/MapView";
import { getCurrentUser } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import backgroundImage from "../assets/background.png";
import Navbar from "../components/Navbar";

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
        <div className="w-full min-h-screen bg-gray-900 overflow-hidden">
            {/* NAVBAR */}
            <Navbar onAuthClick={() => setShowAuthModal(true)} transparent={true} />

            {/* MAIN HERO SECTION - FULL BACKGROUND */}
            <div
                className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden pt-24 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center'
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
                    {/* Left Side - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full mb-12 mt-10 md:mt-0"
                    >
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 italic leading-tight drop-shadow-lg">
                            Идеальный побег
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-100 mb-6 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                            Ваше путешествие к прибрежной магии и скрытым жемчужинам начинается здесь.
                        </p>
                    </motion.div>

                    {/* Travel Planning Form - Horizontal Pill Style (Fully Functional RouteForm) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="w-full"
                    >
                        <div ref={plannerSectionRef}>
                            <RouteForm />
                        </div>
                    </motion.div>
                </div>
            </div>



            {/* PLAN YOUR TRIP VISUALLY SECTION - MINIMALIST */}
            <div className="px-6 py-20 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4">
                            СПЛАНИРУЙТЕ ИДЕАЛЬНОЕ ПУТЕШЕСТВИЕ <span className="text-orange-400 italic font-light">Визуально</span>
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Создайте целостное представление о вашем многодневном маршруте. Попрощайтесь с разрозненными заметками.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-10 pt-12 rounded-3xl rounded-br-[80px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.1)] transition-all relative border border-gray-50/50"
                        >
                            <div className="absolute -top-6 left-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-50">
                                <i className="fas fa-user text-orange-500 text-xl"></i>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                                    1
                                </div>
                                <div className="w-16 h-16 rounded-full border-[3px] border-orange-500 flex items-center justify-center">
                                    <i className="fas fa-route text-orange-500 text-2xl"></i>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                УКАЖИТЕ ПРЕДПОЧТЕНИЯ
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Введите город назначения, бюджет, количество человек и ваши интересы. Система учтет все ваши пожелания.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-10 pt-12 rounded-3xl rounded-br-[80px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.1)] transition-all relative border border-gray-50/50"
                        >
                            <div className="absolute -top-6 left-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-50">
                                <i className="fas fa-user text-orange-500 text-xl"></i>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                                    2
                                </div>
                                <div className="w-16 h-16 rounded-full border-[3px] border-orange-500 flex items-center justify-center">
                                    <i className="fas fa-folder-open text-orange-500 text-2xl"></i>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                ПОЛУЧИТЕ ГОТОВЫЙ ПЛАН
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Наша система автоматически сгенерирует для вас идеальный ежедневный маршрут. Никакого ручного планирования.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-10 pt-12 rounded-3xl rounded-br-[80px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.1)] transition-all relative border border-gray-50/50"
                        >
                            <div className="absolute -top-6 left-12 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-gray-50">
                                <i className="fas fa-user text-orange-500 text-xl"></i>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
                                    3
                                </div>
                                <div className="w-16 h-16 rounded-full border-[3px] border-orange-500 flex items-center justify-center">
                                    <i className="fas fa-map-marked-alt text-orange-500 text-2xl"></i>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
                                Просмотр интерактивной карты
                            </h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Смотрите целостную картину всей вашей поездки. Получайте доступ и делитесь с мобильного устройства.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* TRENDING DESTINATIONS SECTION */}
            <div className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Популярные <span className="text-orange-500 italic font-light">Направления</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl">
                                Исследуйте самые любимые места наших путешественников. Найдите свое следующее приключение.
                            </p>
                        </div>
                        <button className="text-orange-500 font-bold hover:text-orange-600 transition-colors flex items-center gap-2 text-lg">
                            Смотреть все <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { name: "Киото, Япония", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop", rating: "4.9" },
                            { name: "Санторини, Греция", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop", rating: "4.8" },
                            { name: "Рим, Италия", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop", rating: "4.7" },
                            { name: "Париж, Франция", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop", rating: "4.9" }
                        ].map((dest, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="relative h-96 rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
                            >
                                <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <div className="flex justify-between items-center w-full">
                                        <h3 className="text-xl font-bold text-white shadow-sm">{dest.name}</h3>
                                        <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <i className="fas fa-star text-[10px]"></i> {dest.rating}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🗺️ HARITA VE RASTGELE ÜNLÜ YERLER */}
            <div className="w-full bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Откройте для себя <span className="text-orange-500 italic font-light">известные места</span>
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                            Нажмите на кнопку, чтобы увидеть случайное туристическое место
                        </p>
                    </div>
                    <MapView />
                </div>
            </div>

            {/* TESTIMONIALS SECTION */}
            <div className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Истории <span className="text-orange-500 italic font-light">путешественников</span>
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Не верьте нам на слово. Посмотрите, что говорят наши пользователи о своих путешествиях.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { name: "Sarah Jenkins", role: "Одиночный путешественник", text: "GlobeTrip сделал планирование моего тура по Европе совершенно беззаботным. Визуальная планировка карты всё меняет!" },
                            { name: "David & Emma", role: "Молодожены", text: "Мы спланировали всю нашу поездку на Бали здесь. Наличие всех наших ежедневных мероприятий в одном месте сэкономило нам кучу времени." },
                            { name: "Michael Chen", role: "Искатель приключений", text: "Наконец-то приложение, которое визуально упорядочивает мои хаотичные идеи для путешествий. Функция перетаскивания невероятно удобна." }
                        ].map((testi, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-white p-8 rounded-3xl rounded-tl-[60px] shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 relative mt-8"
                            >
                                <div className="absolute -top-8 right-8 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-white text-2xl font-bold">
                                    {testi.name.charAt(0)}
                                </div>
                                <div className="text-orange-400 mb-6 text-xl">
                                    <i className="fas fa-quote-left"></i>
                                </div>
                                <p className="text-gray-600 mb-6 italic leading-relaxed">
                                    "{testi.text}"
                                </p>
                                <div>
                                    <h4 className="font-bold text-gray-900">{testi.name}</h4>
                                    <p className="text-sm text-orange-500 font-medium">{testi.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA SECTION - ORANGE THEME */}
            <div className="py-24 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-md">
                        Вперед, навстречу приключениям!
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-sm">
                        Тысячи путешественников уже планируют свой идеальный отпуск. Не пора ли и вам?
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-white text-orange-600 font-bold text-lg rounded-2xl hover:bg-gray-50 transition-all shadow-xl inline-flex items-center gap-3"
                    >
                        <i className="fas fa-paper-plane"></i>
                        Начать планирование
                    </motion.button>
                </motion.div>
            </div>


            {/* ❓ SSS */}
            <FAQ />



            {/* 🔐 AUTH MODAL */}
            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
            {/* FOOTER SECTION */}
            <footer className="bg-white-900 text-gray-400 py-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="text-2xl font-bold text-white mb-6">
                            mytripplanner
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Ваш личный ИИ-помощник в путешествиях. Создавайте, организуйте и визуализируйте свой идеальный маршрут без усилий.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"><i className="fab fa-facebook-f"></i></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Компания</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">О нас</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Карьера</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Блог о путешествиях</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Пресса</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Поддержка</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Справочный центр</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Информация о безопасности</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Варианты отмены</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Связаться с нами</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Юридическая информация</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Условия использования</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Политика конфиденциальности</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Политика файлов cookie</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-center text-sm">
                    <p>© {new Date().getFullYear()} mytripplanner. Все права защищены.</p>
                </div>
            </footer>
        </div>
    );
}
