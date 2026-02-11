export type TravelMode = "walk" | "drive";

export interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;  // lon değil lng olmalı
    address?: string;
    description?: string;
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
