import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Crown, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Navbar from '../components/Navbar';

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
    icon?: string;
}

const Pricing = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<string>('free');
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const { token, isAuthenticated, user, updateUser } = useAuthStore();

    useEffect(() => {
        loadPlans();
        if (isAuthenticated && token) {
            loadCurrentSubscription();
        }
    }, [token, isAuthenticated]);

    const loadPlans = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/subscription/plans', {
                timeout: 5000,
            });
            setPlans(response.data.plans);
        } catch (error: any) {
            console.error('Plan yüklenemedi:', error);
            // Fallback planlar göster
            setPlans([
                { id: 'free', name: 'Free', price: 0, features: ['3 плана/месяц', 'Базовые ИИ-рекомендации'] },
                { id: 'premium', name: 'Premium', price: 9.99, features: ['Безлимитные планы', 'Продвинутый ИИ'] },
                { id: 'pro', name: 'Pro', price: 19.99, features: ['Премиум-функции', 'VIP-поддержка'] },
            ]);
        }
    };

    const loadCurrentSubscription = async () => {
        if (!isAuthenticated || !token) {
            setCurrentPlan('free');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/api/subscription/current', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000,
            });
            setCurrentPlan(response.data.plan);
        } catch (error: any) {
            console.error('Abonelik bilgisi alınamadı:', error);
            if (error.response?.status === 401) {
                console.log('Token geçersiz, free plan kullanılıyor');
            }
            setCurrentPlan('free');
        }
    };

    const handleSubscribe = async (planId: string) => {
        if (planId === 'free') {
            alert('Вы уже на бесплатном плане!');
            return;
        }

        if (!isAuthenticated || !token) {
            alert('Пожалуйста, войдите в систему! Вы можете сделать это на главной странице.');
            navigate('/', { state: { openAuthModal: true } });
            return;
        }

        setCheckoutLoading(planId);

        try {
            const response = await axios.post(
                'http://localhost:8000/api/subscription/checkout',
                {
                    plan: planId,
                    success_url: `${window.location.origin}/success`,
                    cancel_url: `${window.location.origin}/pricing`
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000, // 30 saniye (Stripe API için yeterli)
                }
            );

            if (response.data?.demo) {
                // DEMO mode - direkt başarılı
                alert(response.data.message || '🎉 Премиум активирован!');

                // Update user's remaining routes to unlimited (-1)
                if (user) {
                    updateUser({
                        ...user,
                        remaining_routes: -1
                    });
                    console.log('✅ Kullanıcı kredisi sınırsıza güncellendi');
                }

                // Reload current subscription
                await loadCurrentSubscription();
                setCheckoutLoading(null);
            } else if (response.data?.checkout_url) {
                // Real Stripe Checkout sayfasına yönlendir
                window.location.href = response.data.checkout_url;
            } else {
                throw new Error('Checkout URL alınamadı');
            }
        } catch (error: any) {
            console.error('Checkout hatası:', error);
            let errorMessage = 'Произошла ошибка. Пожалуйста, попробуйте еще раз.';

            if (error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            } else if (error.request) {
                errorMessage = 'Не удалось подключиться к серверу.';
            }

            alert(errorMessage);
            setCheckoutLoading(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Вы уверены, что хотите отменить подписку?')) {
            return;
        }

        if (!isAuthenticated || !token) {
            alert('Пожалуйста, войдите в систему!');
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                'http://localhost:8000/api/subscription/cancel',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000, // 30 saniye
                }
            );

            alert('Подписка будет отменена в конце текущего периода.');
            await loadCurrentSubscription();
        } catch (error: any) {
            console.error('İptal hatası:', error);
            let errorMessage = 'Ошибка при отмене подписки';

            if (error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            } else if (error.request) {
                errorMessage = 'Не удалось подключиться к серверу';
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getPlanIcon = (planId: string) => {
        if (planId === 'pro') return <Crown className="w-8 h-8 text-orange-500" />;
        if (planId === 'premium') return <Sparkles className="w-8 h-8 text-orange-500" />;
        return null; // free has no icon initially, we could add one if desired. Keep null logic for now.
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/40 font-sans">
            <Navbar />
            <div className="py-12 px-4 pt-32">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Seyahat Planlarınızı{' '}
                            <span className="text-[#EA580C] underline decoration-orange-300 decoration-4 underline-offset-8">
                                Yükseltin
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium max-w-xl mx-auto">
                            Size en uygun planı seçin ve hayalinizdeki tatili oluşturun
                        </p>
                        {currentPlan !== 'free' && (
                            <div className="mt-6">
                                <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
                                    <Check className="w-4 h-4" />
                                    Mevcut Plan: {currentPlan.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ===== TWO-CARD PRICING GRID ===== */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

                        {/* ---- BASIC PLAN (Sol Kart) ---- */}
                        <div className="relative bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                            {/* Free plan aktif göstergesi */}
                            {currentPlan === 'free' && (
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-gray-100 border border-gray-300 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm">
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                        Aktif
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Basic Plan</h3>
                                <p className="text-sm text-gray-400 font-medium mb-4">Başlamak için ideal</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-extrabold text-gray-900">Ücretsiz</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 mb-8"></div>

                            {/* Features */}
                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Ayda 3 Rota',
                                    'Standart AI Planlaması',
                                    'E-posta Desteği',
                                ].map((feature, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mr-3">
                                            <Check className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <span className="text-gray-600 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA — her zaman disabled */}
                            <button
                                disabled
                                className="w-full py-4 px-6 rounded-xl font-extrabold text-base bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 transition-all duration-300"
                            >
                                Mevcut Planınız
                            </button>
                        </div>

                        {/* ---- PREMIUM PLAN (Sağ Kart – vurgulu) ---- */}
                        <div className="relative bg-white rounded-3xl p-8 border-2 border-[#EA580C] shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/15 transition-all duration-300 flex flex-col">
                            {/* "En Popüler" Badge */}
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                                <span className="bg-[#EA580C] text-white px-5 py-1.5 rounded-full text-xs font-extrabold shadow-lg shadow-orange-500/30 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    En Popüler
                                </span>
                            </div>

                            {/* Premium plan aktif göstergesi */}
                            {currentPlan === 'premium' && (
                                <div className="absolute top-4 right-4 z-20">
                                    <span className="bg-[#EA580C] border-2 border-white text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-md">
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                        Aktif
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-[#EA580C] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25">
                                    <Crown className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Premium Plan</h3>
                                <p className="text-sm text-gray-400 font-medium mb-4">Sınırsız deneyim</p>
                                <div className="flex items-baseline justify-center">
                                    <span className="text-5xl font-extrabold text-gray-900">$9.99</span>
                                    <span className="text-gray-400 ml-2 font-bold text-base">/Ay</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-orange-100 mb-8"></div>

                            {/* Features */}
                            <ul className="space-y-4 mb-10 flex-grow">
                                {[
                                    'Sınırsız Rota',
                                    'Gemini 1.5 Pro ile Gelişmiş Detaylar',
                                    'PDF Çıktısı Alma',
                                    'Öncelikli Destek',
                                ].map((feature, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mr-3 border border-orange-100">
                                            <Check className="w-4 h-4 text-[#EA580C]" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA — aktif yükseltme butonu */}
                            <button
                                onClick={() => handleSubscribe('premium')}
                                disabled={currentPlan === 'premium' || checkoutLoading === 'premium'}
                                className={`w-full py-4 px-6 rounded-xl font-extrabold text-base transition-all duration-300 ${
                                    currentPlan === 'premium'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                        : 'bg-[#EA580C] text-white hover:bg-[#c34e0a] shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-[0.98]'
                                }`}
                            >
                                {checkoutLoading === 'premium' ? (
                                    <span className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Bekleniyor...
                                    </span>
                                ) : currentPlan === 'premium' ? (
                                    'Mevcut Planınız'
                                ) : (
                                    'Şimdi Yükselt'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Abonelik İptal Butonu */}
                    {currentPlan !== 'free' && (
                        <div className="text-center mt-12 bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto shadow-sm">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                className="text-gray-500 hover:text-red-600 font-bold transition-colors w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...
                                    </>
                                ) : (
                                    'Aboneliği İptal Et'
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-2">Aboneliğinizi istediğiniz zaman iptal edebilirsiniz.</p>
                        </div>
                    )}

                    {/* Footer Bilgi */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-white/80 backdrop-blur border border-gray-200 rounded-2xl px-8 py-5 shadow-sm">
                            <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                <span className="text-xl">💳</span> Kredi kartı ödemeleri güvenle korunmaktadır.
                            </p>
                            <div className="hidden md:block w-px h-6 bg-gray-200"></div>
                            <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                <span className="text-xl">❓</span> Destek:{' '}
                                <a href="mailto:support@aitripper.com" className="text-[#EA580C] hover:text-orange-700 underline underline-offset-2">
                                    support@aitripper.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;