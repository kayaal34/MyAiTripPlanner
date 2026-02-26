import { useState } from "react";

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
        name: "В сердце культуры Стамбула",
        duration: "1 День",
        category: "Культура",
        searchQuery: "istanbul hagia sophia sunset",
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop"
    },
    {
        id: 2,
        name: "День, полный адреналина в Стамбуле",
        duration: "1 Неделя",
        category: "Приключения",
        searchQuery: "istanbul bosphorus adventure",
        image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&h=600&fit=crop"
    },
    {
        id: 3,
        name: "Развлечения в сердце России",
        duration: "5 Дней",
        category: "Развлечения",
        searchQuery: "moscow red square winter",
        image: "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop"
    },
    {
        id: 4,
        name: "Семейные приключения в Дубае",
        duration: "5 Дней",
        category: "Приключения",
        searchQuery: "dubai burj khalifa fountain",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop"
    },
    {
        id: 5,
        name: "Культура в сердце Белграда",
        duration: "1 Неделя",
        category: "Культура",
        searchQuery: "belgrade kalemegdan sunset",
        image: "https://images.unsplash.com/photo-1590163778416-7e06c1a4b8c3?w=800&h=600&fit=crop"
    },
    {
        id: 6,
        name: "Жемчужина Средиземноморья Мерсин",
        duration: "3 Дня",
        category: "Романтика",
        searchQuery: "mediterranean beach sunset turkey",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
    },
    {
        id: 7,
        name: "Семейная культура в Мейтленде",
        duration: "1 Неделя",
        category: "Культура",
        searchQuery: "australia architecture historic",
        image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&h=600&fit=crop"
    },
    {
        id: 8,
        name: "Романтический побег в Бодруме",
        duration: "5 Дней",
        category: "Романтика",
        searchQuery: "bodrum castle aegean sea",
        image: "https://images.unsplash.com/photo-1605555274618-039ba1f4f0eb?w=800&h=600&fit=crop"
    },
    {
        id: 9,
        name: "Загадочные улицы Праги",
        duration: "5 Дней",
        category: "Культура",
        searchQuery: "prague charles bridge castle",
        image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop"
    },
    {
        id: 10,
        name: "Мужская компания в Праге",
        duration: "5 Дней",
        category: "Развлечения",
        searchQuery: "prague old town male square",
        image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=600&fit=crop"
    },
    {
        id: 11,
        name: "Одинокий побег в Бодрум",
        duration: "2 Недели",
        category: "Развлечения",
        searchQuery: "bodrum beach nightlife zipline",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop"
    },
    {
        id: 12,
        name: "Волшебные развлечения Парижа",
        duration: "3 Дня",
        category: "Развлечения",
        searchQuery: "paris disneyland castle",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop"
    },
];

const categoryColors: Record<string, string> = {
    Культура: "bg-orange-500",
    Приключения: "bg-orange-500",
    Развлечения: "bg-orange-500",
    Романтика: "bg-orange-500",
};

export default function PopularDestinations() {
    const [destinations] = useState<Destination[]>(destinationsData);
    const [loading] = useState(false);

    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 py-16">
                <div className="mb-12 text-center">
                    <h2 className="text-5xl font-display font-bold text-gradient mb-4">
                        Вдохновляющие маршруты
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        Загрузка изображений...
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
                <h2 className="text-5xl font-display font-bold text-gradient mb-4">
                    Вдохновляющие маршруты
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                    Ознакомьтесь с популярными и тщательно подготовленными планами маршрутов.
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
                                className={`${categoryColors[destination.category]
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

                        {/* "Детали" Button on Hover */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="text-white text-sm font-medium flex items-center gap-1 hover:underline">
                                Подробнее →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
