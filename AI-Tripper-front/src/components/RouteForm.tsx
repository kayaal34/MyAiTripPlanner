import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDetailedTripPlan } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useTripStore } from "../store/useTripStore";

// Rusça -> İngilizce çeviriler (Backend'e gönderilecek)
const TRAVELERS_MAP: Record<string, string> = {
    "Один": "yalniz",
    "Пара": "cift",
    "С семьей": "aile",
    "С друзьями": "arkadaslar"
};

const TRANSPORT_MAP: Record<string, string> = {
    "Самолет": "ucak",
    "Автомобиль": "araba",
    "Не важно": "farketmez"
};

const INTERESTS_MAP: Record<string, string> = {
    "Культура": "kultur",
    "Развлечения": "eglence",
    "Вкус": "yemek",
    "Природа": "doga",
    "Приключения": "macera",
    "Романтика": "romantik"
};

export default function RouteForm() {
    const navigate = useNavigate();
    const setCurrentTripPlan = useTripStore((state) => state.setCurrentTripPlan);
    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [transport, setTransport] = useState("");
    const [loadingMessage, setLoadingMessage] = useState("");
    const [normalLoading, setNormalLoading] = useState(false);

    const { token } = useAuthStore();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!city || !travelers || !transport || interests.length === 0) {
            alert("Lütfen tüm alanları doldurun!");
            return;
        }

        if (!token) {
            alert("Plan oluşturmak için giriş yapmalısınız!");
            return;
        }

        setNormalLoading(true);
        
        // Yükleme mesajları
        const messages = [
            "🔍 Form verileri işleniyor...",
            `🌍 ${city} için detaylı plan hazırlanıyor...`,
            "🤖 AI gün gün aktiviteler araştırıyor...",
            "🍽️ Restoran önerileri hazırlanıyor...",
            "🗺️ Her gün için rota oluşturuluyor...",
            "✨ Son detaylar ekleniyor..."
        ];
        
        let messageIndex = 0;
        setLoadingMessage(messages[0]);
        
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 2000);

        try {
            // Backend'e gönderilecek verileri hazırla
            const travelersValue = TRAVELERS_MAP[travelers] || "yalniz";
            const transportValue = TRANSPORT_MAP[transport] || "yuruyerek";
            const interestsValues = interests.map(i => INTERESTS_MAP[i] || i.toLowerCase());

            console.log("📤 API'ye gönderilen veriler:", {
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget: "orta"
            });

            // Yeni API'yi çağır
            const response = await createDetailedTripPlan({
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget: "orta"
            }, token);

            clearInterval(messageInterval);
            setNormalLoading(false);
            setLoadingMessage("");

            console.log("✅ Plan oluşturuldu:", response.itinerary);

            // Store'a kaydet ve sonuç sayfasına yönlendir
            setCurrentTripPlan(response.itinerary);
            navigate("/trip-plan");

        } catch (error: any) {
            clearInterval(messageInterval);
            setNormalLoading(false);
            setLoadingMessage("");
            console.error("❌ Plan oluşturma hatası:", error);
            alert(`Hata: ${error.message || "Plan oluşturulamadı. Lütfen tekrar deneyin."}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full bg-white sm:p-12 p-8 rounded-2xl shadow-xl border border-gray-100"
        >
            <h2 className="text-4xl font-display font-bold mb-10 text-gradient">
                Создать план отпуска
            </h2>

            {/* Hedef */}
            <div className="mb-8">
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Направление
                </label>
                <input
                    type="text"
                    placeholder="Введите название города или страны..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border-2 border-gray-200 py-3.5 px-5 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                    required
                />
            </div>

            {/* Süre ve Kişi (Yan Yana) */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                        Продолжительность поездки
                    </label>
                    <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="w-full border-2 border-gray-200 py-3.5 px-5 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 cursor-pointer"
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                            <option key={d} value={d}>
                                {d} {d === 1 ? "День" : d < 5 ? "Дня" : "Дней"}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-700">
                        Кто едет?
                    </label>
                    <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full border-2 border-gray-200 py-3.5 px-5 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300 cursor-pointer"
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
                <label className="block mb-4 text-sm font-semibold text-gray-700">
                    Интересы
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {interestOptions.map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${
                                interests.includes(interest)
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                                    : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ulaşım */}
            <div className="mb-8">
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Как будете добираться?
                </label>
                <div className="flex gap-3">
                    {["Самолет", "Автомобиль", "Не важно"].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setTransport(option)}
                            className={`flex-1 py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${
                                transport === option
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                                    : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                        >
                            {option === "Самолет" ? "✈️ Самолет" : option === "Автомобиль" ? "🚗 Автомобиль" : "🤷 Не важно"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    disabled={normalLoading || !token}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {normalLoading ? "🔄 Plan Hazırlanıyor..." : "🗓️ Detaylı Gün Gün Plan Oluştur"}
                </button>
                
                {!token && (
                    <p className="text-center text-sm text-red-500 mt-2">
                        ⚠️ Plan oluşturmak için giriş yapmalısınız
                    </p>
                )}
                
                {/* Yükleme Ekranı */}
                {normalLoading && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 mt-4 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-lg font-semibold text-blue-700">{loadingMessage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                            ⏱️ Bu işlem 10-20 saniye sürebilir...
                        </p>
                    </div>
                )}
            </div>
        </form>
    );
}
