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
                    className={`transition-all duration-500 h-full rounded-2xl overflow-hidden ${
                        selectedFamousPlace ? 'w-[calc(100%-500px)]' : 'w-full'
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
                                <Popup>
                                    <div className="text-center">
                                        <strong>{place.name}</strong>
                                        {place.address && (
                                            <p className="text-xs text-slate-600 mt-1">{place.address}</p>
                                        )}
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
