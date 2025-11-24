import type { Place, RouteInfo, TravelMode } from "../type";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Request type - Backend'e göndereceğimiz data
export interface RouteRequest {
    city: string;
    interests: string[];
    stops: number;
    mode: TravelMode;
}

// Response type - Backend'den gelecek data
export interface RouteResponse {
    places: Place[];
    route: RouteInfo;
}

// API Error type
export class ApiError extends Error {
    statusCode?: number;
    details?: unknown;

    constructor(message: string, statusCode?: number, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

/**
 * Backend'e rota isteği gönder
 * @param request - Form'dan gelen veriler (city, interests, stops, mode)
 * @returns Promise<RouteResponse> - Backend'den gelen places ve route
 * @throws ApiError - API hatası durumunda
 */
export async function fetchRoute(request: RouteRequest): Promise<RouteResponse> {
    try {
        // Backend'e POST isteği at
        const response = await fetch(`${API_BASE_URL}/api/route`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        // Hata kontrolü
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP Error: ${response.status}`,
                response.status,
                errorData
            );
        }

        // Response'u parse et
        const data: RouteResponse = await response.json();

        // Validation - Backend'den gelen data doğru mu?
        if (!data.places || !Array.isArray(data.places)) {
            throw new ApiError("Invalid response: places array missing");
        }
        if (!data.route) {
            throw new ApiError("Invalid response: route object missing");
        }

        return data;
    } catch (error) {
        // Network error veya parse error
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            "Network error: Could not connect to backend",
            undefined,
            error
        );
    }
}
