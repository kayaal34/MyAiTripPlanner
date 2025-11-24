import { useMemo } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useTripStore } from "../store/useTripStore";

export default function MapView() {
    // Zustand store'dan places al
    const places = useTripStore((state) => state.places);
    // const route = useTripStore((state) => state.route);

    // Harita merkezi
    const center = useMemo(() => {
        if (!places.length) return { lat: 41.0151, lng: 28.9795 }; // İstanbul varsayılan

        const lat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
        const lon = places.reduce((sum, place) => sum + place.lon, 0) / places.length;

        return { lat, lng: lon };
    }, [places]);

    // API key .env’den çekiliyor
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Eğer API key yoksa uyarı göster
    if (!apiKey) {
        return (
            <div className="flex h-[520px] w-full items-center justify-center rounded-3xl bg-slate-100">
                <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-slate-700">Google Maps API Key Eksik</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Lütfen .env dosyasına <strong>VITE_GOOGLE_MAPS_API_KEY</strong> ekleyin.
                    </p>
                </div>
            </div>
        );
    }

    // GERÇEK HARİTA
    return (
        <APIProvider apiKey={apiKey}>
            <Map
                center={center}
                defaultZoom={13}
                mapId="ai-tripper-map"
                className="h-[520px] w-full rounded-3xl"
                gestureHandling="greedy"
            >
                {places.map((place) => (
                    <Marker
                        key={place.id}
                        position={{ lat: place.lat, lng: place.lon }}
                        title={place.name}
                    />
                ))}
            </Map>
        </APIProvider>
    );
}
