import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useTripStore } from "../store/useTripStore";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue with Leaflet in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function MapView() {
    const places = useTripStore((state) => state.places);

    const center = useMemo<[number, number]>(() => {
        if (!places.length) return [41.0151, 28.9795];

        const lat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
        const lng = places.reduce((sum, place) => sum + place.lng, 0) / places.length;

        return [lat, lng];
    }, [places]);

    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    return (
        <div className="h-[520px] w-full rounded-3xl overflow-hidden">
            <MapContainer
                center={center}
                zoom={13}
                className="h-full w-full"
                zoomControl={true}
                scrollWheelZoom={true}
                attributionControl={false}
            >
                <TileLayer
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
                    maxZoom={19}
                    tileSize={512}
                    zoomOffset={-1}
                />
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
            </MapContainer>
        </div>
    );
}
