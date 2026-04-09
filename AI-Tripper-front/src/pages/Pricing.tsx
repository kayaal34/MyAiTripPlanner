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
                { id: 'free', name: 'Free', price: 0, features: ['3 rota planı/ay', 'Temel AI önerileri'] },
                { id: 'premium', name: 'Premium', price: 9.99, features: ['Sınırsız rota planı', 'Gelişmiş AI'] },
                { id: 'pro', name: 'Pro', price: 19.99, features: ['Premium özellikleri', 'VIP destek'] },
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
            alert('Zaten ücretsiz plandayız!');
            return;
        }

        if (!isAuthenticated || !token) {
            alert('Lütfen önce giriş yapın! Anasayfada giriş yapabilirsiniz.');
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
                alert(response.data.message || '🎉 Premium aktif edildi!');

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
            let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';

            if (error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            } else if (error.request) {
                errorMessage = 'Sunucuya bağlanılamadı. Backend çalışıyor mu kontrol edin.';
            }

            alert(errorMessage);
            setCheckoutLoading(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Aboneliği iptal etmek istediğinizden emin misiniz?')) {
            return;
        }

        if (!isAuthenticated || !token) {
            alert('Lütfen giriş yapın!');
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

            alert('Abonelik dönem sonunda iptal edilecek');
            await loadCurrentSubscription();
        } catch (error: any) {
            console.error('İptal hatası:', error);
            let errorMessage = 'İptal işlemi başarısız';

            if (error.response) {
                errorMessage = error.response.data?.detail || errorMessage;
            } else if (error.request) {
                errorMessage = 'Sunucuya bağlanılamadı';
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
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            <Navbar />
            <div className="py-12 px-4 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Seyahat Planlarını <span className="text-orange-500 underline decoration-orange-300 decoration-4 underline-offset-8">Güçlendir</span>
                        </h1>
                        <p className="text-xl text-gray-500 font-medium">
                            AI destekli seyahat planlaması ile hayallerinizdeki tatili yaratın
                        </p>
                        {currentPlan !== 'free' && (
                            <div className="mt-6">
                                <span className="inline-block bg-orange-100/50 border border-orange-200 text-orange-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                                    Aktif Plan: {currentPlan.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => {
                            const isCurrentPlan = currentPlan === plan.id;
                            const isPopular = plan.id === 'premium';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${isPopular ? 'border-2 border-orange-500 shadow-xl shadow-orange-500/10 scale-105 z-10' : 'border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200'
                                        } ${isCurrentPlan ? 'ring-4 ring-green-500/30 border-green-500' : ''}`}
                                >
                                    {/* Popular Badge */}
                                    {isPopular && (
                                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                                            <span className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-extrabold shadow-lg shadow-orange-500/30 border-2 border-white uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap">
                                                ⭐ EN POPÜLER
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Plan Badge */}
                                    {isCurrentPlan && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="bg-green-500 border-2 border-white text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-md">
                                                <Check className="w-3.5 h-3.5 mr-1" />
                                                Aktif
                                            </span>
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="text-center mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <div className="flex justify-center mb-4">
                                            {getPlanIcon(plan.id) || <div className="w-8 h-8 rounded-full bg-gray-200"></div>}
                                        </div>
                                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2 uppercase tracking-wide">{plan.name}</h3>
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-5xl font-extrabold text-gray-900">
                                                ${plan.price}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-gray-500 ml-2 font-bold uppercase tracking-wider text-sm">/ay</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-10 px-2 flex-grow">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mr-3 border border-orange-100">
                                                    <Check className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isCurrentPlan || checkoutLoading === plan.id}
                                        className={`w-full py-4 px-6 rounded-xl font-extrabold text-lg transition-all duration-300 mt-auto ${isCurrentPlan
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border outline-none'
                                            : isPopular
                                                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30 border border-orange-500 hover:border-orange-600'
                                                : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {checkoutLoading === plan.id ? (
                                            <span className="flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Bekleniyor...
                                            </span>
                                        ) : isCurrentPlan ? (
                                            'Mevcut Plan'
                                        ) : plan.price === 0 ? (
                                            'Ücretsiz Başla'
                                        ) : (
                                            'Premium Ol'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Cancel Subscription Button */}
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
                            <p className="text-xs text-gray-400 mt-2">Dilediğiniz zaman iptal edebilirsiniz.</p>
                        </div>
                    )}

                    {/* FAQ or Info Section */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex flex-col md:flex-row items-center gap-6 bg-white border border-gray-200 rounded-2xl px-8 py-5 shadow-sm">
                            <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                <span className="text-xl">💳</span> Kredi kartı ödemeleri güvenli sağlanmaktadır.
                            </p>
                            <div className="hidden md:block w-px h-6 bg-gray-200"></div>
                            <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                <span className="text-xl">❓</span> Destek için: <a href="mailto:support@aitripper.com" className="text-orange-500 hover:text-orange-600">support@aitripper.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;