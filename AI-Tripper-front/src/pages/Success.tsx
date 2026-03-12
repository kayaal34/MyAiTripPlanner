import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(8);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        console.log('✅ Ödeme başarılı! Session ID:', sessionId);
        console.log('⏳ 8 saniye içinde anasayfaya yönlendirileceksiniz (webhook işleniyor)...');

        // Countdown
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    console.log('🔄 Anasayfaya yönlendiriliyor...');
                    // Tam sayfa yenileme ile anasayfaya git + payment parametresi ekle
                    window.location.href = '/?from_payment=success';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
        };
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    🎉 Ödeme Başarılı!
                </h1>

                <p className="text-gray-600 mb-6">
                    Aboneliğiniz başarıyla aktifleştirildi. Artık sınırsız rota oluşturabilirsiniz!
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                        ✨ Hesabınıza <strong>unlimited routes</strong> eklendi!
                    </p>
                    <p className="text-blue-600 text-xs mt-2">
                        Webhook işleniyor, lütfen bekleyin...
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = '/?from_payment=success'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                    Ana Sayfaya Dön
                </button>

                <p className="text-sm text-gray-500 mt-4">
                    {countdown} saniye içinde otomatik yönlendirileceksiniz...
                </p>
            </div>
        </div>
    );
}
