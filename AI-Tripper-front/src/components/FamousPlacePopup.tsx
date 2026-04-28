import { X } from "lucide-react";
import type { FamousPlace } from "../data/famousPlaces";

interface FamousPlacePopupProps {
    place: FamousPlace;
    onClose: () => void;
}

export default function FamousPlacePopup({ place, onClose }: FamousPlacePopupProps) {
    return (
        <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative h-48 flex-shrink-0">
                <img
                    src={place.imageUrl}
                    alt={place.nameRu}
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-all shadow-md"
                >
                    <X className="w-4 h-4 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="text-sm font-bold text-gray-800">{place.rating}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{place.nameRu}</h3>
                <p className="text-sm text-orange-500 font-medium mb-3">{place.countryRu}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{place.descriptionRu}</p>
            </div>
        </div>
    );
}
