import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDetailedTripPlan } from "../services/api";
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
    const { token, user, updateUser } = useAuthStore();
    const setCurrentTripPlan = useTripStore((state) => state.setCurrentTripPlan);
    const setCurrentTripFormData = useTripStore((state) => state.setCurrentTripFormData);
    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [transport, setTransport] = useState("");
    const [budget, setBudget] = useState("orta");
    const [loadingMessage, setLoadingMessage] = useState("");
    const [normalLoading, setNormalLoading] = useState(false);

    // City autocomplete states
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isCitySelected, setIsCitySelected] = useState(false);
    const [showCityWarning, setShowCityWarning] = useState(false);

    // Fetch city suggestions from OpenStreetMap Nominatim API (free, no key required)
    useEffect(() => {
        if (city.trim().length < 1) {
            setCitySuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                // Normalize Turkish characters for better search
                const searchQuery = city
                    .replace(/İ/g, 'I')
                    .replace(/ı/g, 'i')
                    .replace(/Ş/g, 'S')
                    .replace(/ş/g, 's')
                    .replace(/Ğ/g, 'G')
                    .replace(/ğ/g, 'g')
                    .replace(/Ü/g, 'U')
                    .replace(/ü/g, 'u')
                    .replace(/Ö/g, 'O')
                    .replace(/ö/g, 'o')
                    .replace(/Ç/g, 'C')
                    .replace(/ç/g, 'c');

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=15&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'AI-Trip-Planner'
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('API Response:', data);
                    
                    const cities = data
                        .map((item: any) => {
                            // Şehir adını al - display_name'den veya address'den
                            let cityName = '';
                            let country = '';

                            if (item.address) {
                                // Öncelik sırasına göre şehir adını bul
                                cityName = item.address.city || 
                                          item.address.town || 
                                          item.address.village ||
                                          item.address.municipality ||
                                          item.address.state ||
                                          item.name ||
                                          '';
                                country = item.address.country || '';
                            } else {
                                // address yoksa display_name'den al
                                const parts = item.display_name.split(',');
                                cityName = parts[0]?.trim() || '';
                                country = parts[parts.length - 1]?.trim() || '';
                            }

                            if (cityName && country && cityName !== country) {
                                return `${cityName}, ${country}`;
                            } else if (cityName) {
                                return cityName;
                            }
                            return null;
                        })
                        .filter((value: string | null) => value !== null && value.length > 0)
                        .filter((value: string, index: number, self: string[]) => 
                            self.indexOf(value) === index // Remove duplicates
                        )
                        .slice(0, 8);
                    
                    console.log(`🔍 "${city}" için ${cities.length} şehir bulundu:`, cities);
                    setCitySuggestions(cities);
                    setShowSuggestions(cities.length > 0);
                } else {
                    console.error('API yanıt hatası:', response.status);
                    setCitySuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error("City fetch error:", error);
                setCitySuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [city]);

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
                budget: budget
            });

            // Yeni API'yi çağır
            const response = await createDetailedTripPlan({
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget: budget
            }, token);

            clearInterval(messageInterval);
            setNormalLoading(false);
            setLoadingMessage("");

            console.log("✅ Plan oluşturuldu:", response.itinerary);

            // Kalan krediyi güncelle
            if (response.remaining_routes !== undefined && user) {
                updateUser({
                    ...user,
                    remaining_routes: response.remaining_routes
                });
                console.log("✅ Kredi güncellendi:", response.remaining_routes);
            }

            // Store'a kaydet ve sonuç sayfasına yönlendir
            setCurrentTripPlan(response.itinerary);
            setCurrentTripFormData({
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget: budget
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
                    placeholder="Введите название города..."
                    value={city}
                    onChange={(e) => {
                        setCity(e.target.value);
                        setIsCitySelected(false); // Manuel yazarken seçimi iptal et
                        setShowCityWarning(false); // Uyarıyı kaldır
                    }}
                    onFocus={() => {
                        if (citySuggestions.length > 0) setShowSuggestions(true);
                        setShowCityWarning(false);
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            setShowSuggestions(false);
                            // Eğer şehir yazılmış ama seçilmemişse uyarı göster
                            if (city.trim().length > 0 && !isCitySelected) {
                                setShowCityWarning(true);
                            }
                        }, 200);
                    }}
                    className="w-full border-2 border-gray-200 py-3.5 px-5 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
                    required
                />

                {/* City Suggestions Dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {citySuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setCity(suggestion);
                                    setIsCitySelected(true); // Şehir seçildi
                                    setShowSuggestions(false);
                                }}
                                className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-semibold text-gray-800">{suggestion}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading indicator */}
                {isLoadingSuggestions && (
                    <div className="absolute right-4 top-11 text-gray-400">
                        <div className="animate-spin">⏳</div>
                    </div>
                )}

                {/* Selected City Preview */}
                {isCitySelected && city.trim().length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold text-blue-600">📍 Ваш план путешествия будет создан для:</span>
                            <br />
                            <span className="text-base font-bold text-gray-800 mt-1 inline-block">{city}</span>
                        </p>
                    </div>
                )}

                {/* City Selection Warning */}
                {showCityWarning && !isCitySelected && city.trim().length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <p className="text-sm text-red-700">
                            <span className="font-semibold">⚠️ Пожалуйста, выберите город из списка</span>
                        </p>
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
                            className={`py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${interests.includes(interest)
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
                            className={`flex-1 py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${transport === option
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                        >
                            {option === "Самолет" ? "✈️ Самолет" : option === "Автомобиль" ? "🚗 Автомобиль" : "🤷 Не важно"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bütçe */}
            <div className="mb-8">
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Бюджет
                </label>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setBudget("ekonomik")}
                        className={`flex-1 py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${
                            budget === "ekonomik"
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105"
                                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
                        }`}
                    >
                        💰 Экономный
                    </button>
                    <button
                        type="button"
                        onClick={() => setBudget("orta")}
                        className={`flex-1 py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${
                            budget === "orta"
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg scale-105"
                                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50"
                        }`}
                    >
                        💵 Средний
                    </button>
                    <button
                        type="button"
                        onClick={() => setBudget("luks")}
                        className={`flex-1 py-3.5 px-4 text-base font-semibold rounded-xl transition-all ${
                            budget === "luks"
                                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105"
                                : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                        }`}
                    >
                        💎 Люкс
                    </button>
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
