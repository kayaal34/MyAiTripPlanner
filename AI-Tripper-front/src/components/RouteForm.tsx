import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDetailedTripPlan, getPopularDestinations, type Destination } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useTripStore } from "../store/useTripStore";
import LoadingModal from "./LoadingModal";

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
    const { token } = useAuthStore();
    const setCurrentTripPlan = useTripStore((state) => state.setCurrentTripPlan);
    const setCurrentTripFormData = useTripStore((state) => state.setCurrentTripFormData);
    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [transport, setTransport] = useState("");
    const [loadingMessage, setLoadingMessage] = useState("");
    const [normalLoading, setNormalLoading] = useState(false);

    // Autocomplete states
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Load destinations on component mount
    useEffect(() => {
        const loadDestinations = async () => {
            try {
                console.log("🔄 Şehir listesi yükleniyor...");
                const data = await getPopularDestinations();
                console.log("✅ Şehir listesi yüklendi:", data.length, "şehir");
                setDestinations(data);
            } catch (error) {
                console.error("❌ Şehir listesi yüklenemedi:", error);
            }
        };
        loadDestinations();
    }, []);

    // Filter destinations when city input changes
    useEffect(() => {
        if (city.trim().length > 0) {
            const searchTerm = city
                .toLowerCase()
                .replace(/i̇/g, 'i')  // Türkçe İ düzeltmesi
                .replace(/ı/g, 'i');  // Türkçe ı -> i
            
            const filtered = destinations.filter(dest => {
                const destName = dest.name
                    .toLowerCase()
                    .replace(/i̇/g, 'i')
                    .replace(/ı/g, 'i');
                const destCountry = dest.country
                    .toLowerCase()
                    .replace(/i̇/g, 'i')
                    .replace(/ı/g, 'i');
                
                return destName.includes(searchTerm) || destCountry.includes(searchTerm);
            });
            
            console.log(`🔍 "${city}" için ${filtered.length} sonuç bulundu`);
            setFilteredDestinations(filtered.slice(0, 5)); // Show max 5 suggestions
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredDestinations([]);
            setShowSuggestions(false);
        }
    }, [city, destinations]);

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
            "🤖 En popüler mekanlar araştırıyor...",
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
            setCurrentTripFormData({
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget: "orta"
            });
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
            <div className="mb-8 relative">
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Направление
                </label>
                <input
                    type="text"
                    placeholder="Введите название города или страны..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => city.trim().length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full border-2 border-gray-200 py-3.5 px-5 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                    required
                />
                
                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredDestinations.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredDestinations.map((dest, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setCity(`${dest.name}, ${dest.country}`);
                                    setShowSuggestions(false);
                                }}
                                className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-semibold text-gray-800">{dest.name}</div>
                                <div className="text-sm text-gray-500">{dest.country}</div>
                            </button>
                        ))}
                    </div>
                )}
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
            </div>
            
            {/* Loading Modal */}
            <LoadingModal isOpen={normalLoading} />
        </form>
    );
}
