export type TravelMode = "walk" | "drive";

export interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;  // lon değil lng olmalı
    address?: string;
    description?: string;
    image?: string;  // Mekan görseli URL'i
    day?: number;  // Kaçıncı gün (örn: 1, 2, 3)
    timeSlot?: string;  // Zaman dilimi (örn: "Sabah", "Öğleden Sonra", "Akşam")
}

export interface RouteInfo {
    mode: TravelMode;
    polyline: [number, number][];
    distanceKm: number;
    durationMinutes: number;
}

export interface RouteSummary {
    city: string;
    stops: number;
    interests: string[];
}
