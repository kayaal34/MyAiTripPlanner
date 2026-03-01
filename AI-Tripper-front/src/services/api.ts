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

// ==================== DETAILED TRIP PLANNER API ====================

export type TripPlanRequest = {
    city: string;
    days: number;
    travelers: string;
    interests: string[];
    transport: string;
    budget?: string;
    start_date?: string;
}

export type DailyActivity = {
    name: string;
    type: string;
    address: string;
    coordinates: { lat: number; lng: number };
    duration: string;
    cost: string;
    description: string;
    tips?: string;
}

export type Restaurant = {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    cuisine: string;
    average_cost: string;
    recommended_dishes?: string[];
    description?: string;
    atmosphere?: string;
}

export type DailyItinerary = {
    day: number;
    date: string;
    title: string;
    morning: {
        time: string;
        activities: DailyActivity[];
    };
    lunch: {
        time: string;
        restaurant: Restaurant;
    };
    afternoon: {
        time: string;
        activities: DailyActivity[];
    };
    evening: {
        time: string;
        dinner: Restaurant;
        night_activities: string[];
    };
    daily_tips: {
        weather: string;
        clothing: string;
        important_notes: string;
        estimated_daily_budget: string;
    };
    transportation: {
        getting_around: string;
        estimated_transport_cost: string;
    };
}

export type AccommodationSuggestion = {
    name: string;
    type: string;
    location: string;
    price_range: string;
    why_recommended: string;
}

export type DetailedTripItinerary = {
    trip_summary: {
        destination: string;
        duration_days: number;
        travelers: string;
        total_estimated_cost: string;
        best_season: string;
        weather_forecast: string;
    };
    daily_itinerary: DailyItinerary[];
    accommodation_suggestions: AccommodationSuggestion[];
    general_tips: {
        local_customs: string;
        safety: string;
        money: string;
        emergency_contacts: string;
        useful_phrases: string[];
    };
    packing_list: string[];
    country_flag?: string; // REST Countries API'den gelen bayrak URL'i
}

export type DetailedTripResponse = {
    success: boolean;
    itinerary: DetailedTripItinerary;
    message: string;
}

/**
 * Detaylı gün gün tatil planı oluştur
 * Her gün için sabah, öğle, akşam aktiviteleri, restoranlar ve ipuçları içerir
 */
export async function createDetailedTripPlan(
    request: TripPlanRequest,
    token: string
): Promise<DetailedTripResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/trip-planner`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || "Failed to create trip plan",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error creating trip plan", undefined, error);
    }
}

// ==================== SAVE TRIP TO FAVORITES ====================

export type SaveTripRequest = {
    is_saved: boolean;
    name: string;
}

export type SavedTripResponse = {
    id: number;
    user_id: number;
    name: string;
    city: string;
    country: string;
    duration_days: number;
    travelers: string;
    interests: string[];
    budget?: string;
    transport: string;
    trip_plan: DetailedTripItinerary;
    is_saved: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Trip'i favorilere kaydet - Yeni trip oluşturur (POST)
 * Artık sadece kullanıcı "Kaydet" butonuna basınca veritabanına ekleniyor
 */
export async function saveTripToFavorites(
    tripPlan: DetailedTripItinerary,
    name: string,
    city: string,
    days: number,
    travelers: string,
    interests: string[],
    budget: string,
    transport: string,
    token: string
): Promise<SavedTripResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routes/saved`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                city: city,
                country: tripPlan.trip_summary?.destination || "",
                duration_days: days,
                travelers: travelers,
                interests: interests,
                budget: budget,
                transport: transport,
                trip_plan: tripPlan,
                is_saved: true,
                name: name,
                mode: "walk" // deprecated field
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.detail || "Failed to save trip",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error saving trip", undefined, error);
    }
}

/**
 * Kayıtlı trip'leri getir (is_saved = true)
 */
export async function getSavedTrips(token: string): Promise<SavedTripResponse[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routes/saved`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get saved trips", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting saved trips", undefined, error);
    }
}

/**
 * Kayıtlı trip'i sil
 */
export async function deleteSavedTrip(tripId: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/routes/saved/${tripId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to delete saved trip", response.status);
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error deleting trip", undefined, error);
    }
}


// ============= Contact Form API =============

export type ContactMessageRequest = {
    name: string;
    email: string;
    subject?: string;
    message: string;
}

export type ContactMessageResponse = {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

/**
 * İletişim formu mesajı gönder (login gerekmez)
 */
export async function sendContactMessage(data: ContactMessageRequest): Promise<ContactMessageResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new ApiError(
                errorData?.detail || "Failed to send message",
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error sending contact message", undefined, error);
    }
}

/**
 * Tüm contact mesajlarını getir (admin için)
 */
export async function getContactMessages(token: string, unreadOnly: boolean = false): Promise<ContactMessageResponse[]> {
    try {
        const url = unreadOnly 
            ? `${API_BASE_URL}/api/contact/messages?unread_only=true`
            : `${API_BASE_URL}/api/contact/messages`;
            
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get contact messages", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting contact messages", undefined, error);
    }
}

/**
 * Contact mesajını okundu olarak işaretle
 */
export async function markMessageAsRead(messageId: number, token: string): Promise<ContactMessageResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/messages/${messageId}/read`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to mark message as read", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error marking message as read", undefined, error);
    }
}

// ============= DESTINATIONS API =============

export type Destination = {
    name: string;
    country: string;
}

export type DestinationsResponse = {
    success: boolean;
    destinations: Destination[];
}

/**
 * Popüler şehir ve ülke listesini getir (autocomplete için)
 */
export async function getPopularDestinations(): Promise<Destination[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/destinations`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new ApiError("Failed to get destinations", response.status);
        }

        const data: DestinationsResponse = await response.json();
        return data.destinations;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting destinations", undefined, error);
    }
}
