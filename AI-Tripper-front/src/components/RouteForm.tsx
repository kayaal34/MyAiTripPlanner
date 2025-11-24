import { useState } from "react";
import { useCreateRoute } from "../hooks/useCreateRoute";

export default function RouteForm() {
    const [days, setDays] = useState(3);
    const [city, setCity] = useState("");
    const [style, setStyle] = useState("");

    const { mutate: createRoute, isPending: loading, error } = useCreateRoute();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createRoute({
            city,
            interests: [style], // tarzı interests olarak gönderiyoruz
            stops: days,
            mode: "walk", // artık görünmüyor ama backend için sabit
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-lg border"
        >
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
                Tatil Planı Oluştur
            </h2>

            {/* 3 Kolon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Kaç Gün */}
                <div>
                    <label className="block mb-2 font-medium">Kaç Gün?</label>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full border p-3 rounded-xl"
                    >
                        {[1,2,3,4,5,6,7].map((d) => (
                            <option key={d} value={d}>{d} gün</option>
                        ))}
                    </select>
                </div>

                {/* Nereye */}
                <div>
                    <label className="block mb-2 font-medium">Nereye?</label>
                    <input
                        type="text"
                        placeholder="Örn: Paris, İstanbul..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                        required
                    />
                </div>

                {/* Tatil Tarzı */}
                <div>
                    <label className="block mb-2 font-medium">Tatil Tarzı</label>
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full border p-3 rounded-xl"
                        required
                    >
                        <option value="" disabled>Seç...</option>
                        <option value="kültür">Kültür & Tarih</option>
                        <option value="deniz">Deniz & Plaj</option>
                        <option value="doğa">Doğa & Yürüyüş</option>
                        <option value="alışveriş">Alışveriş</option>
                        <option value="gece hayatı">Gece Hayatı</option>
                    </select>
                </div>

            </div>

            {/* Hata Mesajı */}
            {error && (
                <p className="text-red-500 mt-3">
                    Hata: {error.message}
                </p>
            )}

            {/* Buton */}
            <button
                type="submit"
                disabled={loading}
                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white 
                           px-6 py-3 rounded-xl w-full text-lg font-semibold transition"
            >
                {loading ? "Oluşturuluyor..." : "Tatili Planla"}
            </button>
        </form>
    );
}
