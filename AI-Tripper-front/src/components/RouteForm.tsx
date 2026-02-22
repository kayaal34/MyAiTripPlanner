import { useState } from "react";
import { useCreateRoute } from "../hooks/useCreateRoute";
import { createPersonalizedTrip } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

export default function RouteForm() {
    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [transport, setTransport] = useState("");
    const [personalizedLoading, setPersonalizedLoading] = useState(false);
    const [personalizedError, setPersonalizedError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [normalLoading, setNormalLoading] = useState(false);

    const { user, token } = useAuthStore();

    const { mutate: createRoute, isPending: loading, error } = useCreateRoute();

    const interestOptions = [
        "Культура",
        "Развлечения",
        "Вкус",
        "Природа",
        "Приключения",
        "Романтика",
    ];

    const toggleInterest = (interest: string) => {
        setInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handlePersonalizedTrip = async () => {
        if (!token) {
            setPersonalizedError("Kişiselleştirilmiş plan için giriş yapmalısınız");
            return;
        }

        setPersonalizedLoading(true);
        setPersonalizedError(null);
        
        // Dinamik yükleme mesajları
        const messages = [
            "🔍 Veriler iletiliyor...",
            "🤖 AI profilinizi analiz ediyor...",
            "🌍 En uygun rotalar araştırılıyor...",
            "✨ Kişiselleştirilmiş plan hazırlanıyor...",
            "🎯 Son detaylar ekleniyor..."
        ];
        
        let messageIndex = 0;
        setLoadingMessage(messages[0]);
        
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 1500);
        
        try {
            const response = await createPersonalizedTrip(token);
            clearInterval(messageInterval);
            // Plan başarıyla oluşturuldu
            console.log("Personalized trip created:", response.plan);
            // TODO: Plan sonuçlarını göster (modal veya yeni sayfa)
            alert(`🎉 Kişiselleştirilmiş tatil planınız hazır!\n\n📍 Destinasyon: ${response.plan.destination}\n⏱️ Süre: ${response.plan.trip_duration}\n🎯 Tema: ${response.plan.trip_theme}`);
        } catch (error) {
            clearInterval(messageInterval);
            setPersonalizedError("Kişiselleştirilmiş plan oluşturulamadı. Lütfen tekrar deneyin.");
        } finally {
            setPersonalizedLoading(false);
            setLoadingMessage("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!city || !travelers || !transport) {
            return;
        }

        setNormalLoading(true);
        
        // Yükleme mesajları
        const messages = [
            "🔍 Form verileri işleniyor...",
            `🌍 ${city} için en iyi yerler araştırılıyor...`,
            "✨ İlgi alanlarınıza göre filtrele...",
            "🗺️ Rota optimize ediliyor...",
            "🎯 Son kontroller yapılıyor..."
        ];
        
        let messageIndex = 0;
        setLoadingMessage(messages[0]);
        
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 1200);

        // Backend'in beklediği formata çevir
        const stops = parseInt(days) * 5; // Her gün için 5 durak
        const mode = transport === "Автомобиль" ? "drive" : "walk";
        
        createRoute({
            city,
            interests,
            stops,
            mode,
        });

        // Loading temizleme işi React Query'nin başarı/hata callback'lerinde yapılacak
        setTimeout(() => {
            clearInterval(messageInterval);
            setNormalLoading(false);
            setLoadingMessage("");
        }, 6000); // 6 saniye sonra temizle
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full bg-white sm:p-10 p-8 rounded-3xl shadow-2xl border border-gray-100"
        >
            <h2 className="text-4xl font-bold mb-10 text-[#1e3a8a]">
                Создать план отпуска
            </h2>

            {/* Hedef */}
            <div className="mb-8">
                <label className="block mb-3 text-sm font-semibold text-gray-600">
                    Направление
                </label>
                <input
                    type="text"
                    placeholder="Введите название города или страны..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-300 py-3 px-4 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                />
            </div>

            {/* Süre ve Kişi (Yan Yana) */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-600">
                        Продолжительность поездки
                    </label>
                    <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full border border-gray-300 py-3 px-4 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>
                                {d} {d === 1 ? "День" : d < 5 ? "Дня" : "Дней"}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-600">
                        Кто едет?
                    </label>
                    <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full border border-gray-300 py-3 px-4 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="" disabled>
                            Выберите...
                        </option>
                        <option value="Один">Один</option>
                        <option value="С друзьями">С друзьями</option>
                        <option value="С семьей">С семьей</option>
                        <option value="Пара">Пара</option>
                    </select>
                </div>
            </div>

            {/* İlgi Alanları */}
            <div className="mb-8">
                <label className="block mb-4 text-sm font-semibold text-gray-600">
                    Интересы
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {interestOptions.map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`py-3 px-4 text-base font-medium rounded-xl transition-all ${interests.includes(interest)
                                ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                                : "bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ulaşım */}
            <div className="mb-8">
                <label className="block mb-3 text-sm font-semibold text-gray-600">
                    Предпочтительный транспорт
                </label>
                <div className="flex gap-3">
                    {["Самолет", "Автомобиль", "Не важно"].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setTransport(option)}
                            className={`flex-1 py-3 px-4 text-base font-medium rounded-xl transition-all ${transport === option
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hata Mesajları */}
            {error && (
                <p className="text-red-500 mb-6 text-center font-medium text-lg">
                    Ошибка: {error.message}
                </p>
            )}
            
            {personalizedError && (
                <p className="text-red-500 mb-6 text-center font-medium text-lg">
                    {personalizedError}
                </p>
            )}

            {/* Butonlar */}
            <div className="space-y-4">
                {/* Kişiselleştirilmiş AI Tatil Planı */}
                {user && (
                    <div>
                        <button
                            type="button"
                            onClick={handlePersonalizedTrip}
                            disabled={personalizedLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                        >
                            {personalizedLoading ? "🤖 AI Çalışıyor..." : "🎯 Özelliklerime Göre Tatil Planla (AI)"}
                        </button>
                        
                        {/* Yükleme Ekranı */}
                        {personalizedLoading && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200 mb-4 text-center">
                                <div className="flex items-center justify-center space-x-3 mb-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    <span className="text-lg font-semibold text-purple-700">{loadingMessage}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Normal Rota Oluştur */}
                <div>
                    <button
                        type="submit"
                        disabled={loading || normalLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || normalLoading ? "🔄 Rota Hazırlanıyor..." : "📍 Manuel Rota Oluştur"}
                    </button>
                    
                    {/* Normal Yükleme Ekranı */}
                    {(loading || normalLoading) && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 mt-4 text-center">
                            <div className="flex items-center justify-center space-x-3 mb-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                <span className="text-lg font-semibold text-orange-700">{loadingMessage}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {!user && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                        💡 Giriş yapın ve profilinizi doldurun, size özel AI tatil planları oluşturalım!
                    </p>
                )}
            </div>
        </form>
    );
}
