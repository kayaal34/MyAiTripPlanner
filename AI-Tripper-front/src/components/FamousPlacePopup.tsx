import { X } from "lucide-react";
import type { FamousPlace } from "../data/famousPlaces";

interface FamousPlacePopupProps {
    place: FamousPlace;
    onClose: () => void;
}

export default function FamousPlacePopup({ place, onClose }: FamousPlacePopupProps) {
    return (
        <div className="relative h-full w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-md"
            >
                <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Image */}
            <div className="relative h-72 overflow-hidden">
                <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-4xl font-bold mb-2">{place.nameRu}</h2>
                    <p className="text-base opacity-90 font-medium">{place.country}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100%-18rem)]">
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                        {place.year}
                    </span>
                    {place.fact && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                            ⭐ Удивительный факт
                        </span>
                    )}
                </div>
                
                <p className="text-gray-700 leading-relaxed text-base mb-4">
                    {place.description}
                </p>

                {place.fact && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-l-4 border-orange-400">
                        <p className="text-sm font-semibold text-orange-900 mb-1">💡 Вау-факт:</p>
                        <p className="text-sm text-orange-800 leading-relaxed">
                            {place.fact}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
