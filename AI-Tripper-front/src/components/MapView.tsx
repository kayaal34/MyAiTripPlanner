import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useTripStore } from "../store/useTripStore";
import { famousPlaces } from "../data/famousPlaces";
import type { FamousPlace } from "../data/famousPlaces";
import FamousPlacePopup from "./FamousPlacePopup";
import { Sparkles } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue with Leaflet in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Red marker icon for famous places
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapView() {
    const places = useTripStore((state) => state.places);
    const [selectedFamousPlace, setSelectedFamousPlace] = useState<FamousPlace | null>(null);

    const center = useMemo<[number, number]>(() => {
        if (selectedFamousPlace) {
            return [selectedFamousPlace.lat, selectedFamousPlace.lng];
        }
        if (!places.length) return [41.0151, 28.9795];

        const lat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
        const lng = places.reduce((sum, place) => sum + place.lng, 0) / places.length;

        return [lat, lng];
    }, [places, selectedFamousPlace]);

    const handleRandomPlace = () => {
        const randomPlace = famousPlaces[Math.floor(Math.random() * famousPlaces.length)];
        setSelectedFamousPlace(randomPlace);
    };

    const handleClosePopup = () => {
        setSelectedFamousPlace(null);
    };

    return (
        <div className="relative h-[520px] w-full rounded-3xl overflow-hidden bg-gray-100">
            {/* Main container with flex */}
            <div className="flex h-full w-full gap-4">
                {/* Map Container */}
                <div
                    className={`transition-all duration-500 h-full rounded-2xl overflow-hidden ${selectedFamousPlace ? 'w-[calc(100%-500px)]' : 'w-full'
                        }`}
                >
                    <MapContainer
                        center={center}
                        zoom={selectedFamousPlace ? 8 : 13}
                        className="h-full w-full"
                        zoomControl={true}
                        scrollWheelZoom={true}
                        attributionControl={true}
                        key={selectedFamousPlace ? `${selectedFamousPlace.id}` : 'default'}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* User's trip places */}
                        {places.map((place, index) => (
                            <Marker
                                key={place.id || index}
                                position={[place.lat, place.lng]}
                            >
                                <Popup maxWidth={600} minWidth={450} className="custom-popup">
                                    <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-lg">
                                        {/* Görsel */}
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <img
                                                src={place.image || "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800"}
                                                alt={place.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop';
                                                }}
                                            />
                                            {place.day && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                                    {place.day}. Gün
                                                </div>
                                            )}
                                        </div>

                                        {/* İçerik */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                {place.name}
                                            </h3>

                                            {place.timeSlot && (
                                                <div className="text-sm text-gray-600 mb-3">
                                                    🕐 {place.timeSlot}
                                                </div>
                                            )}

                                            {place.description && (
                                                <p className="text-sm text-gray-600 mb-4">
                                                    {place.description}
                                                </p>
                                            )}

                                            {place.address && (
                                                <p className="text-xs text-gray-500 mb-4">
                                                    📍 {place.address}
                                                </p>
                                            )}

                                            {/* Butonlar */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const query = encodeURIComponent(`${place.name}, ${place.address || ''}`);
                                                        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
                                                        window.open(url, "_blank");
                                                    }}
                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg text-sm"
                                                >
                                                    Google Maps
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const url = `https://yandex.com/maps/?pt=${place.lng},${place.lat}&z=15`;
                                                        window.open(url, "_blank");
                                                    }}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg text-sm"
                                                >
                                                    Yandex Maps
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Famous place marker (red) */}
                        {selectedFamousPlace && (
                            <Marker
                                position={[selectedFamousPlace.lat, selectedFamousPlace.lng]}
                                icon={redIcon}
                            >
                                <Popup>
                                    <div className="text-center font-bold">
                                        {selectedFamousPlace.nameRu}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Famous Place Popup - appears on the right */}
                {selectedFamousPlace && (
                    <div className="w-[480px] h-full flex-shrink-0">
                        <FamousPlacePopup place={selectedFamousPlace} onClose={handleClosePopup} />
                    </div>
                )}
            </div>

            {/* Random Famous Place Button */}
            <button
                onClick={handleRandomPlace}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-[500]"
            >
                <Sparkles className="w-5 h-5" />
                Случайное знаменитое место
            </button>
        </div>
    );
}
