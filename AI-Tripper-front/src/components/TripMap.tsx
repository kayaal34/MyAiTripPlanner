import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox token - from environment variable only
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_TOKEN) {
    console.warn('VITE_MAPBOX_ACCESS_TOKEN is not set in environment variables');
}

type Location = {
    name: string;
    lat: number;
    lng: number;
    description?: string;
};

type TripMapProps = {
    cityName: string;
    locations?: Location[];
};

// Şehir koordinatları
const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
    'istanbul': { lat: 41.0082, lng: 28.9784, zoom: 12 },
    'i̇stanbul': { lat: 41.0082, lng: 28.9784, zoom: 12 },
    'paris': { lat: 48.8566, lng: 2.3522, zoom: 12 },
    'tokyo': { lat: 35.6762, lng: 139.6503, zoom: 12 },
    'new york': { lat: 40.7128, lng: -74.0060, zoom: 12 },
    'london': { lat: 51.5074, lng: -0.1278, zoom: 12 },
    'londra': { lat: 51.5074, lng: -0.1278, zoom: 12 },
    'dubai': { lat: 25.2048, lng: 55.2708, zoom: 12 },
    'roma': { lat: 41.9028, lng: 12.4964, zoom: 12 },
    'rome': { lat: 41.9028, lng: 12.4964, zoom: 12 },
    'barcelona': { lat: 41.3851, lng: 2.1734, zoom: 12 },
    'barselona': { lat: 41.3851, lng: 2.1734, zoom: 12 },
    'amsterdam': { lat: 52.3676, lng: 4.9041, zoom: 12 },
    'berlin': { lat: 52.5200, lng: 13.4050, zoom: 12 },
    'prague': { lat: 50.0755, lng: 14.4378, zoom: 12 },
    'prag': { lat: 50.0755, lng: 14.4378, zoom: 12 },
    'vienna': { lat: 48.2082, lng: 16.3738, zoom: 12 },
    'viyana': { lat: 48.2082, lng: 16.3738, zoom: 12 },
    'budapest': { lat: 47.4979, lng: 19.0402, zoom: 12 },
    'budapeşte': { lat: 47.4979, lng: 19.0402, zoom: 12 },
    'athens': { lat: 37.9838, lng: 23.7275, zoom: 12 },
    'atina': { lat: 37.9838, lng: 23.7275, zoom: 12 },
    'bangkok': { lat: 13.7563, lng: 100.5018, zoom: 12 },
    'singapore': { lat: 1.3521, lng: 103.8198, zoom: 12 },
    'singapur': { lat: 1.3521, lng: 103.8198, zoom: 12 },
    'sydney': { lat: 33.8688, lng: 151.2093, zoom: 12 },
    'lisbon': { lat: 38.7223, lng: -9.1393, zoom: 12 },
    'lizbon': { lat: 38.7223, lng: -9.1393, zoom: 12 },
    'madrid': { lat: 40.4168, lng: -3.7038, zoom: 12 },
    'munich': { lat: 48.1351, lng: 11.5820, zoom: 12 },
    'münih': { lat: 48.1351, lng: 11.5820, zoom: 12 },
    'ankara': { lat: 39.9334, lng: 32.8597, zoom: 12 },
    'antalya': { lat: 36.8969, lng: 30.7133, zoom: 12 },
    'bodrum': { lat: 37.0344, lng: 27.4305, zoom: 12 },
    'kapadokya': { lat: 38.6431, lng: 34.8289, zoom: 12 },
    'bali': { lat: -8.3405, lng: 115.0920, zoom: 12 },
    'maldivler': { lat: 3.2028, lng: 73.2207, zoom: 9 },
    'maldives': { lat: 3.2028, lng: 73.2207, zoom: 9 },
};

mapboxgl.accessToken = MAPBOX_TOKEN;

export default function TripMap({ cityName, locations = [] }: TripMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // Şehir adını temizle ve koordinatları bul
    const cleanCityName = cityName.toLowerCase()
        .split(',')[0]
        .trim()
        .replace(/i̇/g, 'i')
        .replace(/ı/g, 'i');

    const cityData = CITY_COORDINATES[cleanCityName] || { lat: 41.0082, lng: 28.9784, zoom: 12 };

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [cityData.lng, cityData.lat],
            zoom: cityData.zoom,
        });

        map.current.on('load', () => {
            // Şehir merkezi marker
            const centerMarker = document.createElement('div');
            centerMarker.style.width = '20px';
            centerMarker.style.height = '20px';
            centerMarker.style.background = 'linear-gradient(135deg, #ff3333 0%, #cc0000 100%)';
            centerMarker.style.borderRadius = '50% 50% 50% 0';
            centerMarker.style.transform = 'rotate(-45deg)';
            centerMarker.style.border = '2px solid white';
            centerMarker.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            centerMarker.style.cursor = 'pointer';
            centerMarker.style.position = 'relative';
            centerMarker.style.display = 'flex';
            centerMarker.style.alignItems = 'center';
            centerMarker.style.justifyContent = 'center';

            const innerDot = document.createElement('div');
            innerDot.style.position = 'absolute';
            innerDot.style.width = '3px';
            innerDot.style.height = '3px';
            innerDot.style.backgroundColor = 'white';
            innerDot.style.borderRadius = '50%';
            innerDot.style.zIndex = '10';
            centerMarker.appendChild(innerDot);

            const centerPopup = new mapboxgl.Popup({ offset: [0, -10] }).setText(cityName);
            const centerMarkerObj = new mapboxgl.Marker({ element: centerMarker })
                .setLngLat([cityData.lng, cityData.lat])
                .setPopup(centerPopup)
                .addTo(map.current!);

            // Center marker click handler
            centerMarker.addEventListener('click', (e) => {
                e.stopPropagation();
                centerMarkerObj.getPopup()?.addTo(map.current!);
            });

            // Aktivite lokasyonları
            locations.forEach((location) => {
                const markerElement = document.createElement('div');
                markerElement.style.width = '20px';
                markerElement.style.height = '20px';
                markerElement.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
                markerElement.style.borderRadius = '50% 50% 50% 0';
                markerElement.style.transform = 'rotate(-45deg)';
                markerElement.style.border = '2px solid white';
                markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                markerElement.style.cursor = 'pointer';
                markerElement.style.position = 'relative';
                markerElement.style.display = 'flex';
                markerElement.style.alignItems = 'center';
                markerElement.style.justifyContent = 'center';

                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '3px';
                dot.style.height = '3px';
                dot.style.backgroundColor = 'white';
                dot.style.borderRadius = '50%';
                dot.style.zIndex = '10';
                markerElement.appendChild(dot);

                // Hover effect - shadow only, no scaling
                markerElement.addEventListener('mouseenter', () => {
                    markerElement.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
                });
                markerElement.addEventListener('mouseleave', () => {
                    markerElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                });

                const popup = new mapboxgl.Popup({ offset: [0, -10] }).setText(location.name);
                const marker = new mapboxgl.Marker({ element: markerElement })
                    .setLngLat([location.lng, location.lat])
                    .setPopup(popup)
                    .addTo(map.current!);

                // Click handler - open popup
                markerElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    marker.getPopup()?.addTo(map.current!);
                });
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [cityData, locations]);

    return (
        <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
    );
}
