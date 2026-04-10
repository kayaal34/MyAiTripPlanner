import { useState, useEffect, useRef } from "react";
import { famousPlaces } from "../data/famousPlaces";
import type { FamousPlace } from "../data/famousPlaces";
import FamousPlacePopup from "./FamousPlacePopup";
import { Sparkles } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Mapbox token - from environment variable only
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MAPBOX_TOKEN) {
    console.warn('VITE_MAPBOX_ACCESS_TOKEN is not set in environment variables');
}
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function MapView() {
    const [selectedFamousPlace, setSelectedFamousPlace] = useState<FamousPlace | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    const handleRandomPlace = () => {
        const randomPlace = famousPlaces[Math.floor(Math.random() * famousPlaces.length)];
        setSelectedFamousPlace(randomPlace);
    };

    const handleClosePopup = () => {
        setSelectedFamousPlace(null);
    };

    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const famousPlaceRef = useRef(selectedFamousPlace);

    // Update refs when values change
    useEffect(() => {
        famousPlaceRef.current = selectedFamousPlace;
    }, [selectedFamousPlace]);

    // Initialize map once
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-74.5, 40],
            zoom: 3.5,
        });

        map.current.on('load', () => {
            addMarkers();
        });

        // ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            if (map.current) {
                map.current.resize();
            }
        });
        resizeObserver.observe(mapContainer.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Update markers when selectedFamousPlace changes
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        addMarkers();
    }, [selectedFamousPlace]);

    // Helper function to add markers
    const addMarkers = () => {
        if (!map.current) return;

        // Remove old markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add famous place marker if selected (red marker)
        if (famousPlaceRef.current) {
            const famousMarkerElement = document.createElement('div');
            famousMarkerElement.style.width = '24px';
            famousMarkerElement.style.height = '24px';
            famousMarkerElement.style.background = 'linear-gradient(135deg, #ff3333 0%, #cc0000 100%)';
            famousMarkerElement.style.borderRadius = '50%';
            famousMarkerElement.style.border = '2px solid white';
            famousMarkerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
            famousMarkerElement.style.cursor = 'pointer';
            famousMarkerElement.style.position = 'relative';
            famousMarkerElement.style.display = 'flex';
            famousMarkerElement.style.alignItems = 'center';
            famousMarkerElement.style.justifyContent = 'center';

            const innerDot = document.createElement('div');
            innerDot.style.position = 'absolute';
            innerDot.style.width = '4px';
            innerDot.style.height = '4px';
            innerDot.style.backgroundColor = 'white';
            innerDot.style.borderRadius = '50%';
            innerDot.style.zIndex = '10';
            famousMarkerElement.appendChild(innerDot);

            // Hover effect - shadow only, no scaling
            famousMarkerElement.addEventListener('mouseenter', () => {
                famousMarkerElement.style.boxShadow = '0 5px 12px rgba(0,0,0,0.5)';
            });
            famousMarkerElement.addEventListener('mouseleave', () => {
                famousMarkerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
            });

            const popup = new mapboxgl.Popup({ offset: [0, -15] }).setText(famousPlaceRef.current.nameRu);
            const marker = new mapboxgl.Marker({ element: famousMarkerElement })
                .setLngLat([famousPlaceRef.current.lng, famousPlaceRef.current.lat])
                .setPopup(popup)
                .addTo(map.current!);

            // Click handler - open popup
            famousMarkerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                marker.getPopup()?.addTo(map.current!);
            });

            markersRef.current.push(marker);

            // Fly to famous place
            if (map.current) {
                map.current.flyTo({
                    center: [famousPlaceRef.current.lng, famousPlaceRef.current.lat],
                    zoom: 8,
                    duration: 1000
                });
            }
        }
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
                    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
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
