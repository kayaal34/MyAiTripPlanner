import { useState, useEffect } from "react";

interface Destination {
    id: number;
    name: string;
    duration: string;
    category: string;
    searchQuery: string;
    image?: string;
}

const destinationsData: Destination[] = [
    {
        id: 1,
        name: "İstanbul'da Kültürün Kalbinde",
        duration: "1 Gün",
        category: "Kültür",
        searchQuery: "istanbul hagia sophia sunset",
    },
    {
        id: 2,
        name: "İstanbul'da Adrenalin Dolu Bir Gün",
        duration: "1 Hafta",
        category: "Macera",
        searchQuery: "istanbul bosphorus adventure",
    },
    {
        id: 3,
        name: "Rusya'nın Kalbinde Eğlence",
        duration: "5 Gün",
        category: "Eğlence",
        searchQuery: "moscow red square winter",
    },
    {
        id: 4,
        name: "Dubai'de Ailece Adrenalin",
        duration: "5 Gün",
        category: "Macera",
        searchQuery: "dubai burj khalifa fountain",
    },
    {
        id: 5,
        name: "Belgrad'ın Kalbinde Kültür",
        duration: "1 Hafta",
        category: "Kültür",
        searchQuery: "belgrade kalemegdan sunset",
    },
    {
        id: 6,
        name: "Akdeniz'in İncisi Mersin",
        duration: "3 Gün",
        category: "Romantik",
        searchQuery: "mediterranean beach sunset turkey",
    },
    {
        id: 7,
        name: "Maitland'da Ailece Kültür",
        duration: "1 Hafta",
        category: "Kültür",
        searchQuery: "australia architecture historic",
    },
    {
        id: 8,
        name: "Bodrum'da Romantik Bir Kaçış",
        duration: "5 Gün",
        category: "Romantik",
        searchQuery: "bodrum castle aegean sea",
    },
    {
        id: 9,
        name: "Prag'ın Gizemli Sokakları",
        duration: "5 Gün",
        category: "Kültür",
        searchQuery: "prague charles bridge castle",
    },
    {
        id: 10,
        name: "Prag'da Erkek Erkeğe Eğlence",
        duration: "5 Gün",
        category: "Eğlence",
        searchQuery: "prague old town male square",
    },
    {
        id: 11,
        name: "Bodrum'da Yalnız Bir Kaçış",
        duration: "2 Hafta",
        category: "Eğlence",
        searchQuery: "bodrum beach nightlife zipline",
    },
    {
        id: 12,
        name: "Paris'in Büyülü Eğlencesi",
        duration: "3 Gün",
        category: "Eğlence",
        searchQuery: "paris disneyland castle",
    },
];

const categoryColors: Record<string, string> = {
    Kültür: "bg-orange-500",
    Macera: "bg-orange-500",
    Eğlence: "bg-orange-500",
    Romantik: "bg-orange-500",
};

export default function PopularDestinations() {
    const [destinations, setDestinations] = useState<Destination[]>(destinationsData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
            
            if (!key) {
                console.warn("Unsplash API key not found");
                setDestinations(destinationsData.map(d => ({
                    ...d,
                    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
                })));
                setLoading(false);
                return;
            }

            try {
                const updatedDestinations = await Promise.all(
                    destinationsData.map(async (dest) => {
                        try {
                            const response = await fetch(
                                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(dest.searchQuery)}&orientation=landscape&client_id=${key}`
                            );
                            const data = await response.json();
                            return {
                                ...dest,
                                image: data.urls?.regular || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
                            };
                        } catch (error) {
                            console.error(`Error fetching image for ${dest.name}:`, error);
                            return {
                                ...dest,
                                image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
                            };
                        }
                    })
                );
                setDestinations(updatedDestinations);
            } catch (error) {
                console.error("Error fetching images:", error);
                setDestinations(destinationsData.map(d => ({
                    ...d,
                    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"
                })));
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 py-16">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-[#1e3a8a] mb-3">
                        İlham Veren Rotalar
                    </h2>
                    <p className="text-lg text-gray-600">
                        Görseller yükleniyor...
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="h-56 rounded-2xl bg-gray-200 animate-pulse"
                        ></div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-6 py-16">
            {/* Header */}
            <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold text-[#1e3a8a] mb-3">
                    İlham Veren Rotalar
                </h2>
                <p className="text-lg text-gray-600">
                    Popüler ve özenle hazırlanmış rota planlarına göz atın.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {destinations.map((destination) => (
                    <div
                        key={destination.id}
                        className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                        {/* Image */}
                        <img
                            src={destination.image}
                            alt={destination.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                            <span
                                className={`${
                                    categoryColors[destination.category]
                                } text-white text-xs font-bold px-3 py-1 rounded-full`}
                            >
                                {destination.category}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-base mb-1 line-clamp-2">
                                {destination.name}
                            </h3>
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                                <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>{destination.duration}</span>
                            </div>
                        </div>

                        {/* "Detayları Gör" Button on Hover */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="text-white text-sm font-medium flex items-center gap-1 hover:underline">
                                Detayları Gör →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
