import type { Place, RouteInfo, TravelMode } from "../type";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Request type - Backend'e göndereceğimiz data
export type RouteRequest = {
    city: string;
    interests: string[];
    stops: number;
    mode: TravelMode;
}

// Response type - Backend'den gelecek data
export type RouteResponse = {
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
 * @param token - Optional JWT token for authenticated requests
 * @returns Promise<RouteResponse> - Backend'den gelen places ve route
 * @throws ApiError - API hatası durumunda
 */
export async function fetchRoute(request: RouteRequest, token?: string): Promise<RouteResponse> {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        
        // Add auth token if available
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Backend'e POST isteği at
        const response = await fetch(`${API_BASE_URL}/api/route`, {
            method: "POST",
            headers,
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

// ==================== AUTH API ====================

export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    full_name: string;
}

export type LoginRequest = {
    username: string;
    password: string;
}

export type AuthResponse = {
    access_token: string;
    token_type: string;
}

export type UserResponse = {
    id: number;
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
    bio?: string;
    hobbies?: string[];
    interests?: string[];
    avatar_url?: string;
    created_at: string;
    
    // Personal preferences for AI trip planning
    gender?: string;
    preferred_countries?: string[];
    vacation_types?: string[];
    travel_style?: string;
    age_range?: string;
}

/**
 * Register new user
 */
export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || "Registration failed",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error during registration", undefined, error);
    }
}

/**
 * Login user
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    try {
        // FastAPI OAuth2PasswordRequestForm expects form data
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || "Login failed",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error during login", undefined, error);
    }
}

/**
 * Get current user info
 */
export async function getCurrentUser(token: string): Promise<UserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get user info", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting user", undefined, error);
    }
}

// ==================== PROFILE API ====================

export type UpdateProfileRequest = {
    full_name?: string;
    bio?: string;
    hobbies?: string[];
    interests?: string[];
    avatar_url?: string;
    
    // Personal preferences for AI trip planning
    gender?: string;
    preferred_countries?: string[];
    vacation_types?: string[];
    travel_style?: string;
    age_range?: string;
}

/**
 * Update user profile
 */
export async function updateProfile(token: string, data: UpdateProfileRequest): Promise<UserResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || "Failed to update profile",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error updating profile", undefined, error);
    }
}

/**
 * Delete user account
 */
export async function deleteAccount(token: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to delete account", response.status);
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error deleting account", undefined, error);
    }
}

// ==================== ROUTES API ====================

export type SavedRouteResponse = {
    id: number;
    user_id: number;
    name: string;
    city: string;
    interests: string[];
    places: Place[];
    mode: string;
    distance_km?: number;
    duration_minutes?: number;
    created_at: string;
    updated_at: string;
}

export type RouteHistoryResponse = {
    id: number;
    user_id: number;
    city: string;
    interests: string[];
    stops: number;
    mode: string;
    places: Place[];
    created_at: string;
}

/**
 * Get user's saved routes
 */
export async function getSavedRoutes(token: string): Promise<SavedRouteResponse[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routes/saved`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get saved routes", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting routes", undefined, error);
    }
}

/**
 * Get user's route history
 */
export async function getRouteHistory(token: string): Promise<RouteHistoryResponse[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get route history", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting history", undefined, error);
    }
}

/**
 * Create personalized trip plan based on user preferences
 */
export async function createPersonalizedTrip(token: string): Promise<PersonalizedTripResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/personalized-trip`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to create personalized trip", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error creating trip", undefined, error);
    }
}

export type PersonalizedTripResponse = {
    success: boolean;
    plan: {
        destination: string;
        trip_duration: string;
        trip_theme: string;
        recommendations: Array<{
            day: number;
            title: string;
            activities: string[];
            places: string[];
            tips: string;
        }>;
        personal_notes: string;
        budget_estimate: string;
        best_time: string;
    };
    message: string;
}
