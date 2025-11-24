export type TravelMode = "walk" | "drive";

export interface Place {
    id: string;
    name: string;
    description: string;
    interest: string;
    lat: number;
    lon: number;
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
