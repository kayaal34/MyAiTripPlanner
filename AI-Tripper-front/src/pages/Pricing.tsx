import { useState, useEffect } from 'react';
import { Check, X, Loader2, Crown, Sparkles } from 'lucide-react';
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
            alert('Lütfen önce giriş yapın!');
            window.location.href = '/login';
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
                    timeout: 10000,
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
                // Backend'den gelen hata
                errorMessage = error.response.data?.detail || errorMessage;
            } else if (error.request) {
                // Network hatası - backend'e ulaşılamadı
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
                    timeout: 10000,
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
        if (planId === 'pro') return <Crown className="w-6 h-6 text-purple-400" />;
        if (planId === 'premium') return <Sparkles className="w-6 h-6 text-blue-400" />;
        return null;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 pt-28">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Seyahat Planlarını <span className="text-blue-600">Güçlendir</span>
                        </h1>
                        <p className="text-xl text-gray-600">
                            AI destekli seyahat planlaması ile hayallerinizdeki tatili yaratın
                        </p>
                        {currentPlan !== 'free' && (
                            <div className="mt-4">
                                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                    Aktif Plan: {currentPlan.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => {
                            const isCurrentPlan = currentPlan === plan.id;
                            const isPopular = plan.id === 'premium';

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
                                        } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                                >
                                    {/* Popular Badge */}
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                                ⭐ EN POPÜLER
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Plan Badge */}
                                    {isCurrentPlan && (
                                        <div className="absolute -top-4 right-4">
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                <Check className="w-3 h-3 inline mr-1" />
                                                Aktif
                                            </span>
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="text-center mb-6">
                                        <div className="flex justify-center mb-3">
                                            {getPlanIcon(plan.id)}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-5xl font-extrabold text-gray-900">
                                                ${plan.price}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-gray-500 ml-2">/ay</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isCurrentPlan || checkoutLoading === plan.id}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${isCurrentPlan
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : isPopular
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {checkoutLoading === plan.id ? (
                                            <span className="flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Yönlendiriliyor...
                                            </span>
                                        ) : isCurrentPlan ? (
                                            'Mevcut Plan'
                                        ) : plan.price === 0 ? (
                                            'Ücretsiz Başla'
                                        ) : (
                                            'Hemen Başla'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Cancel Subscription Button */}
                    {currentPlan !== 'free' && (
                        <div className="text-center mt-12">
                            <button
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 underline text-sm font-medium"
                            >
                                {loading ? 'İşleniyor...' : 'Aboneliği İptal Et'}
                            </button>
                        </div>
                    )}

                    {/* FAQ or Info Section */}
                    <div className="mt-16 text-center text-gray-600">
                        <p className="text-sm">
                            💳 Tüm ödemeler Stripe ile güvenli bir şekilde işlenir
                        </p>
                        <p className="text-sm mt-2">
                            ❓ Sorularınız için: support@aitripper.com
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Pricing;