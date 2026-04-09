import type { Place } from "../type";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
    remaining_routes?: number;
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
    username?: string;
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
    transport?: string;
    budget?: string;
    start_date?: string;
    language?: string;
}

export type DailyActivity = {
    time: string;
    name: string;
    type: string;
    address: string;
    coordinates: { lat: number; lng: number };
    duration: string;
    cost: string;
    description: string;
}

export type DailyItinerary = {
    day: number;
    date: string;
    title: string;
    activities: DailyActivity[];
    estimated_daily_budget: string;
    transportation_note: string;
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
    country_flag?: string; // REST Countries API'den gelen bayrak URL'i
    city_image?: string;
}

export type DetailedTripResponse = {
    success: boolean;
    itinerary: DetailedTripItinerary;
    remaining_routes?: number;
    message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function asNumber(value: unknown, fallback = 0): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toDailyActivity(value: unknown): DailyActivity {
    if (!isRecord(value)) {
        return {
            time: "",
            name: "",
            type: "",
            address: "",
            coordinates: { lat: 0, lng: 0 },
            duration: "",
            cost: "",
            description: "",
        };
    }

    const coordinates = isRecord(value.coordinates) ? value.coordinates : {};

    return {
        time: typeof value.time === "string" ? value.time : "",
        name: typeof value.name === "string" ? value.name : "",
        type: typeof value.type === "string" ? value.type : "",
        address: typeof value.address === "string" ? value.address : "",
        coordinates: {
            lat: asNumber(coordinates.lat),
            lng: asNumber(coordinates.lng),
        },
        duration: typeof value.duration === "string" ? value.duration : "",
        cost: typeof value.cost === "string" ? value.cost : "",
        description: typeof value.description === "string" ? value.description : "",
    };
}

function toDailyItinerary(value: unknown, fallbackDay: number): DailyItinerary {
    if (!isRecord(value)) {
        return {
            day: fallbackDay,
            date: "",
            title: "",
            activities: [],
            estimated_daily_budget: "",
            transportation_note: "",
        };
    }

    return {
        day: asNumber(value.day, fallbackDay),
        date: typeof value.date === "string" ? value.date : "",
        title: typeof value.title === "string" ? value.title : "",
        activities: Array.isArray(value.activities)
            ? value.activities.map((activity) => toDailyActivity(activity))
            : [],
        estimated_daily_budget:
            typeof value.estimated_daily_budget === "string" ? value.estimated_daily_budget : "",
        transportation_note:
            typeof value.transportation_note === "string" ? value.transportation_note : "",
    };
}

function toDetailedTripItinerary(value: unknown): DetailedTripItinerary {
    if (!isRecord(value)) {
        throw new ApiError("Invalid itinerary: response is not an object");
    }

    const summary = isRecord(value.trip_summary) ? value.trip_summary : {};

    return {
        trip_summary: {
            destination: typeof summary.destination === "string" ? summary.destination : "",
            duration_days: typeof summary.duration_days === "number" ? summary.duration_days : 0,
            travelers: typeof summary.travelers === "string" ? summary.travelers : "",
            total_estimated_cost: typeof summary.total_estimated_cost === "string" ? summary.total_estimated_cost : "",
            best_season: typeof summary.best_season === "string" ? summary.best_season : "",
            weather_forecast: typeof summary.weather_forecast === "string" ? summary.weather_forecast : "",
        },
        daily_itinerary: Array.isArray(value.daily_itinerary)
            ? value.daily_itinerary.map((day, index) => toDailyItinerary(day, index + 1))
            : [],
        country_flag: typeof value.country_flag === "string" ? value.country_flag : undefined,
        city_image: typeof value.city_image === "string" ? value.city_image : undefined,
    };
}

function toDetailedTripResponse(value: unknown): DetailedTripResponse {
    if (!isRecord(value)) {
        throw new ApiError("Invalid response: payload is not an object");
    }

    return {
        success: Boolean(value.success),
        itinerary: toDetailedTripItinerary(value.itinerary),
        remaining_routes: typeof value.remaining_routes === "number" ? value.remaining_routes : undefined,
        message: typeof value.message === "string" ? value.message : "",
    };
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
            
            // 401 Unauthorized - Token geçersiz veya süresi dolmuş
            if (response.status === 401) {
                // localStorage'daki token'ı temizle
                localStorage.removeItem('auth-storage');
                // Kullanıcıyı login sayfasına yönlendir
                window.location.href = '/';
                throw new ApiError(
                    "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
                    401,
                    errorData
                );
            }
            
            throw new ApiError(
                errorData.detail || "Failed to create trip plan",
                response.status,
                errorData
            );
        }

        const rawData: unknown = await response.json();
        return toDetailedTripResponse(rawData);
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
                name: name
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

// ============= SUBSCRIPTION API =============

export type Plan = {
    id: string;
    name: string;
    price: number;
    features: string[];
}

export type Subscription = {
    id: number;
    user_id: number;
    plan: string;
    status: string;
    amount: number;
    currency: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
}

export type CheckoutRequest = {
    plan: string;
    success_url: string;
    cancel_url: string;
}

export type CheckoutResponse = {
    checkout_url: string;
    session_id: string;
}

/**
 * Tüm plan seçeneklerini getir
 */
export async function getPlans(): Promise<Plan[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subscription/plans`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new ApiError("Failed to get plans", response.status);
        }

        const data = await response.json();
        return data.plans;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting plans", undefined, error);
    }
}

/**
 * Kullanıcının mevcut aboneliğini getir
 */
export async function getCurrentSubscription(token: string): Promise<Subscription> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subscription/current`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new ApiError("Failed to get subscription", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error getting subscription", undefined, error);
    }
}

/**
 * Stripe Checkout session oluştur
 */
export async function createCheckoutSession(
    checkoutRequest: CheckoutRequest,
    token: string
): Promise<CheckoutResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subscription/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(checkoutRequest),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(error.detail || "Failed to create checkout", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error creating checkout", undefined, error);
    }
}

/**
 * Aboneliği iptal et
 */
export async function cancelSubscription(token: string): Promise<{ message: string; current_period_end: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(error.detail || "Failed to cancel subscription", response.status);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Network error canceling subscription", undefined, error);
    }
}
