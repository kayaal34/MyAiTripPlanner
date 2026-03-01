import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
const CITY_COORDINATES: Record<string, [number, number]> = {
    'istanbul': [41.0082, 28.9784],
    'i̇stanbul': [41.0082, 28.9784],
    'paris': [48.8566, 2.3522],
    'tokyo': [35.6762, 139.6503],
    'new york': [40.7128, -74.0060],
    'london': [51.5074, -0.1278],
    'londra': [51.5074, -0.1278],
    'dubai': [25.2048, 55.2708],
    'roma': [41.9028, 12.4964],
    'rome': [41.9028, 12.4964],
    'barcelona': [41.3851, 2.1734],
    'barselona': [41.3851, 2.1734],
    'amsterdam': [52.3676, 4.9041],
    'berlin': [52.5200, 13.4050],
    'prague': [50.0755, 14.4378],
    'prag': [50.0755, 14.4378],
    'vienna': [48.2082, 16.3738],
    'viyana': [48.2082, 16.3738],
    'budapest': [47.4979, 19.0402],
    'budapeşte': [47.4979, 19.0402],
    'athens': [37.9838, 23.7275],
    'atina': [37.9838, 23.7275],
    'bangkok': [13.7563, 100.5018],
    'singapore': [1.3521, 103.8198],
    'singapur': [1.3521, 103.8198],
    'sydney': [33.8688, 151.2093],
    'lisbon': [38.7223, -9.1393],
    'lizbon': [38.7223, -9.1393],
    'madrid': [40.4168, -3.7038],
    'munich': [48.1351, 11.5820],
    'münih': [48.1351, 11.5820],
    'ankara': [39.9334, 32.8597],
    'antalya': [36.8969, 30.7133],
    'bodrum': [37.0344, 27.4305],
    'kapadokya': [38.6431, 34.8289],
    'bali': [-8.3405, 115.0920],
    'maldivler': [3.2028, 73.2207],
    'maldives': [3.2028, 73.2207],
};

// Kırmızı pin ikonu
const redIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function TripMap({ cityName, locations = [] }: TripMapProps) {
    // Şehir adını temizle ve koordinatları bul
    const cleanCityName = cityName.toLowerCase()
        .split(',')[0]
        .trim()
        .replace(/i̇/g, 'i')
        .replace(/ı/g, 'i');
    
    const cityCoords = CITY_COORDINATES[cleanCityName] || [41.0082, 28.9784]; // Varsayılan: İstanbul

    return (
        <MapContainer
            center={cityCoords}
            zoom={12}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Şehir merkezi marker */}
            <Marker position={cityCoords} icon={redIcon}>
                <Popup>
                    <div className="text-center">
                        <h3 className="font-bold text-lg">{cityName}</h3>
                        <p className="text-sm text-gray-600">Şehir Merkezi</p>
                    </div>
                </Popup>
            </Marker>

            {/* Aktivite lokasyonları */}
            {locations.map((location, index) => (
                <Marker 
                    key={index} 
                    position={[location.lat, location.lng]} 
                    icon={redIcon}
                >
                    <Popup>
                        <div className="text-center">
                            <h4 className="font-semibold">{location.name}</h4>
                            {location.description && (
                                <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
