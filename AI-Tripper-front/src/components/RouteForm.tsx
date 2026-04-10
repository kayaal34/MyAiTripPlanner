import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "./LoadingModal";
import { createDetailedTripPlan } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useTripStore } from "../store/useTripStore";

const TRAVELERS_MAP: Record<string, string> = {
    "Один": "yalniz",
    "Пара": "cift",
    "С семьей": "aile",
    "С друзьями": "arkadaslar",
};

const INTERESTS_MAP: Record<string, string> = {
    "Культура": "kultur",
    "Развлечения": "eglence",
    "Вкус": "yemek",
    "Природа": "doga",
    "Приключения": "macera",
    "Романтика": "romantik",
};

type NominatimResult = {
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state?: string;
        country?: string;
    };
    display_name?: string;
    name?: string;
};

interface RouteFormProps {
    onRequireAuth?: () => void;
}

export default function RouteForm({ onRequireAuth }: RouteFormProps) {
    const navigate = useNavigate();
    const { token, user, updateUser } = useAuthStore();
    const setCurrentTripPlan = useTripStore((state) => state.setCurrentTripPlan);
    const setCurrentTripFormData = useTripStore((state) => state.setCurrentTripFormData);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const isSelectingCityRef = useRef(false);

    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [budget, setBudget] = useState("orta");
    const [normalLoading, setNormalLoading] = useState(false);
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState("Планирование...");
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isCitySelected, setIsCitySelected] = useState(false);
    const [showCityWarning, setShowCityWarning] = useState(false);

    useEffect(() => {
        if (isCitySelected) {
            setShowSuggestions(false);
            return;
        }

        if (city.trim().length < 1) {
            setCitySuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                const searchQuery = city
                    .replace(/İ/g, "I")
                    .replace(/ı/g, "i")
                    .replace(/Ş/g, "S")
                    .replace(/ş/g, "s")
                    .replace(/Ğ/g, "G")
                    .replace(/ğ/g, "g")
                    .replace(/Ü/g, "U")
                    .replace(/ü/g, "u")
                    .replace(/Ö/g, "O")
                    .replace(/ö/g, "o")
                    .replace(/Ç/g, "C")
                    .replace(/ç/g, "c");

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=15&addressdetails=1&featuretype=city&accept-language=ru`,
                    { headers: { "User-Agent": "AI-Trip-Planner" } }
                );

                if (!response.ok) {
                    setCitySuggestions([]);
                    setShowSuggestions(false);
                    return;
                }

                const data: NominatimResult[] = await response.json();
                const cities = data
                    .map((item) => {
                        let cityName = "";
                        let country = "";

                        if (item.address) {
                            cityName =
                                item.address.city ||
                                item.address.town ||
                                item.address.village ||
                                item.address.municipality ||
                                item.address.state ||
                                item.name ||
                                "";
                            country = item.address.country || "";
                        } else if (item.display_name) {
                            const parts = item.display_name.split(",");
                            cityName = parts[0]?.trim() || "";
                            country = parts[parts.length - 1]?.trim() || "";
                        }

                        if (cityName && country && cityName !== country) {
                            return `${cityName}, ${country}`;
                        }

                        return cityName || null;
                    })
                    .filter((value): value is string => value !== null && value.length > 0)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .slice(0, 8);

                setCitySuggestions(cities);
                setShowSuggestions(cities.length > 0);
            } catch (error) {
                console.error("City fetch error:", error);
                setCitySuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [city, isCitySelected]);

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
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
        );
    };

    const goToNextStep = () => {
        if (currentStep === 1 && (!city.trim() || !isCitySelected)) {
            setShowCityWarning(true);
            return;
        }

        if (currentStep < 3) {
            setCurrentStep((prev) => (prev + 1) as 2 | 3);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!city || !travelers || interests.length === 0) {
            alert("Пожалуйста, заполните все поля!");
            return;
        }

        if (!token) {
            onRequireAuth?.();
            return;
        }

        setNormalLoading(true);

        const messages = [
            "Обработка данных формы...",
            `Составляется подробный план для ${city}...`,
            "Исследуются популярные места...",
            "Подбираются лучшие рестораны...",
            "Формируется маршрут на каждый день...",
            "Добавляются финальные детали...",
        ];

        let messageIndex = 0;
        setCurrentLoadingMessage(messages[0]);

        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setCurrentLoadingMessage(messages[messageIndex]);
        }, 2000);

        try {
            const travelersValue = TRAVELERS_MAP[travelers] || "yalniz";
            const transportValue = "farketmez";
            const interestsValues = interests.map((interest) => INTERESTS_MAP[interest] || interest.toLowerCase());

            const response = await createDetailedTripPlan(
                {
                    city,
                    days: parseInt(days),
                    travelers: travelersValue,
                    interests: interestsValues,
                    transport: transportValue,
                    budget,
                    language: "Russian",
                },
                token
            );

            clearInterval(messageInterval);
            setNormalLoading(false);
            setCurrentLoadingMessage("Планирование...");

            if (response.remaining_routes !== undefined && user) {
                updateUser({ ...user, remaining_routes: response.remaining_routes });
            }

            setCurrentTripPlan(response.itinerary);
            setCurrentTripFormData({
                city,
                days: parseInt(days),
                travelers: travelersValue,
                interests: interestsValues,
                transport: transportValue,
                budget,
            });
            navigate("/trip-plan");
        } catch (error: unknown) {
            clearInterval(messageInterval);
            setNormalLoading(false);
            setCurrentLoadingMessage("Планирование...");

            const message = error instanceof Error ? error.message : "Plan oluşturulamadı. Lütfen tekrar deneyin.";
            console.error("❌ Plan oluşturma hatası:", error);
            alert(`Hata: ${message}`);
        }
    };

    return (
        <form
            onSubmit={(e) => {
                if (currentStep !== 3) {
                    e.preventDefault();
                    return;
                }
                handleSubmit(e);
            }}
            className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 w-full"
        >
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-600">Step {currentStep} of 3</p>
                    <p className="text-xs text-gray-500">{Math.round((currentStep / 3) * 100)}%</p>
                </div>
                <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                </div>
            </div>

            <div className="min-h-[260px] transition-all duration-300 ease-in-out">
                {currentStep === 1 && (
                    <div className="max-w-2xl mx-auto text-center animate-[fadeIn_.25s_ease]">
                        <label className="block text-orange-500 font-bold tracking-wide text-base md:text-lg mb-4">
                            Направление
                        </label>
                        <div className="relative group text-left">
                            <input
                                type="text"
                                placeholder="Где отдохнем?"
                                value={city}
                                   ref={cityInputRef}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setCity(newValue);
                                    // Sadece manuel yazış durumunda sıfırla, suggestion seçimi değil
                                    if (!isSelectingCityRef.current) {
                                        setIsCitySelected(false);
                                    }
                                    setShowCityWarning(false);
                                }}
                                onFocus={() => {
                                    if (citySuggestions.length > 0 && !isCitySelected) {
                                        setShowSuggestions(true);
                                    }
                                    setShowCityWarning(false);
                                }}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowSuggestions(false);
                                        if (city.trim().length > 0 && !isCitySelected) {
                                            setShowCityWarning(true);
                                        }
                                    }, 200);
                                }}
                                className="w-full bg-white border-2 border-orange-200 rounded-2xl px-5 py-4 text-lg md:text-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                                required
                            />
                            <i className="fas fa-map-marker-alt absolute right-5 top-1/2 -translate-y-1/2 text-orange-400 text-lg pointer-events-none"></i>

                            {showSuggestions && citySuggestions.length > 0 && (
                                <div className="absolute z-50 w-full top-full mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto text-left">
                                    {citySuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                isSelectingCityRef.current = true;
                                                setCity(suggestion);
                                                setIsCitySelected(true);
                                                setShowSuggestions(false);
                                                setCitySuggestions([]);
                                                isSelectingCityRef.current = false;
                                                   // Menu'yi kesin kapat
                                                   cityInputRef.current?.blur();
                                            }}
                                            className="w-full text-left px-5 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-b-0"
                                        >
                                            <div className="font-semibold text-gray-800 text-sm">{suggestion}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isLoadingSuggestions && (
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                    <i className="fas fa-spinner fa-spin"></i>
                                </div>
                            )}

                            <AnimatePresence>
                                {isCitySelected && city.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                        transition={{ duration: 0.28, ease: "easeOut" }}
                                        className="absolute z-40 w-full top-full mt-3 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg shadow-lg"
                                    >
                                        <p className="text-xs text-emerald-700 font-semibold">✨ Ваш план будет составлен для этого города</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {showCityWarning && !isCitySelected && city.trim().length > 0 && (
                                <div className="absolute z-40 w-full top-full mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
                                    <p className="text-xs text-red-700">
                                        <span className="font-bold">⚠️ Пожалуйста, выберите город из списка</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-[fadeIn_.25s_ease]">
                        <div className="relative group rounded-2xl border border-gray-200 p-5">
                            <label className="text-orange-500 font-bold tracking-wide text-sm md:text-base mb-2 block">Дни</label>
                            <div className="relative">
                                <div className="w-full appearance-none bg-transparent text-gray-700 text-lg hover:text-gray-900 transition-colors cursor-pointer pr-6">{days}</div>
                                <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                            </div>
                            <div className="absolute z-50 w-full left-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setDays(d.toString());
                                                (document.activeElement as HTMLElement)?.blur();
                                            }}
                                            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${days === d.toString() ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50"}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative group rounded-2xl border border-gray-200 p-5">
                            <label className="text-orange-500 font-bold tracking-wide text-sm md:text-base mb-2 block">Кто едет?</label>
                            <div className="relative">
                                <div className="w-full appearance-none bg-transparent text-gray-700 text-lg hover:text-gray-900 transition-colors cursor-pointer pr-6 truncate">{travelers || "Выберите..."}</div>
                                <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                            </div>
                            <div className="absolute z-50 w-full left-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {["Один", "С друзьями", "С семьей", "Пара"].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTravelers(opt);
                                                (document.activeElement as HTMLElement)?.blur();
                                            }}
                                            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${travelers === opt ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50"}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-[fadeIn_.25s_ease]">
                        <div className="relative group rounded-2xl border border-gray-200 p-5">
                            <label className="text-orange-500 font-bold tracking-wide text-sm md:text-base mb-2 block">Интересы</label>
                            <div className="relative">
                                <div className="w-full appearance-none bg-transparent text-gray-700 text-lg hover:text-gray-900 transition-colors cursor-pointer pr-6 truncate">{interests.length > 0 ? `${interests.length} Выбрано` : "Выбрать..."}</div>
                                <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                            </div>
                            <div className="absolute z-50 w-full top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="grid grid-cols-2 gap-2">
                                    {interestOptions.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleInterest(interest);
                                            }}
                                            className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${interests.includes(interest) ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-orange-50"}`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative group rounded-2xl border border-gray-200 p-5">
                            <label className="text-orange-500 font-bold tracking-wide text-sm md:text-base mb-2 block">Бюджет</label>
                            <div className="relative">
                                <div className="w-full appearance-none bg-transparent text-gray-700 text-lg hover:text-gray-900 transition-colors cursor-pointer pr-6 truncate">{budget === "ekonomik" ? "Экономный" : budget === "orta" ? "Средний" : "Люкс"}</div>
                                <i className="fas fa-chevron-down absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
                            </div>
                            <div className="absolute z-[60] w-full left-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="flex flex-col gap-1">
                                    {[
                                        { value: "ekonomik", label: "Экономный" },
                                        { value: "orta", label: "Средний" },
                                        { value: "luks", label: "Люкс" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setBudget(opt.value);
                                                (document.activeElement as HTMLElement)?.blur();
                                            }}
                                            className={`py-2 px-3 text-sm font-bold rounded-xl transition-all text-left ${budget === opt.value ? "bg-orange-50 text-orange-500" : "bg-transparent text-gray-600 hover:bg-gray-50"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 1 || normalLoading}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Назад
                </button>

                {currentStep < 3 ? (
                    <button
                        type="button"
                        onClick={goToNextStep}
                        disabled={normalLoading}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Далее
                    </button>
                ) : (
                    <div className="w-full sm:w-auto text-right">
                        <button
                            type="submit"
                            disabled={normalLoading}
                            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-2xl transition-all shadow-lg shadow-orange-500/30 text-base md:text-lg flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <i className={normalLoading ? "fas fa-spinner fa-spin" : "fas fa-magic"}></i>
                            {normalLoading ? "Загрузка..." : "Создать план"}
                        </button>
                        {!token && (
                            <p className="text-center sm:text-right text-[10px] text-red-500 mt-2 whitespace-nowrap">
                                ⚠️ Требуется вход
                            </p>
                        )}
                    </div>
                )}
            </div>

            <LoadingModal isOpen={normalLoading} currentMessage={currentLoadingMessage} />
        </form>
    );
}
