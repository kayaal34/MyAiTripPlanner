import { useState } from "react";
import { useCreateRoute } from "../hooks/useCreateRoute";

export default function RouteForm() {
    const [city, setCity] = useState("");
    const [days, setDays] = useState("3");
    const [travelers, setTravelers] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [budget, setBudget] = useState("");
    const [transport, setTransport] = useState("");

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createRoute({
            city,
            interests: interests.length > 0 ? interests : ["Общий"],
            stops: Number(days),
            mode: transport === "Автомобиль" ? "drive" : "walk",
        });
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

            {/* Bütçe ve Ulaşım (Yan Yana) */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Bütçe */}
                <div>
                    <label className="block mb-3 text-sm font-semibold text-gray-600">
                        Бюджет на человека
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                            ₽
                        </span>
                        <input
                            type="number"
                            placeholder="0"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full border border-gray-300 py-3 px-4 pl-10 text-lg rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Ulaşım */}
                <div>
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
            </div>

            {/* Hata Mesajı */}
            {error && (
                <p className="text-red-500 mb-6 text-center font-medium text-lg">
                    Ошибка: {error.message}
                </p>
            )}

            {/* Gönder Butonu */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Ваш план создается..." : "Давайте спланируем!"}
            </button>
        </form>
    );
}
