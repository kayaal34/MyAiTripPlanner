import { create } from "zustand";
import type { Place, RouteInfo, TravelMode } from "../type";
import type { DetailedTripItinerary } from "../services/api";

// Store'da tutacağımız state'in type'ı
interface TripState {
    // Form değerleri
    city: string;
    interests: string[];
    stops: number;
    mode: TravelMode;

    // API'den gelen veriler
    places: Place[];
    route: RouteInfo | null;
    
    // Yeni AI Trip Planner
    currentTripPlan: DetailedTripItinerary | null;

    // Loading/Error durumları
    isLoading: boolean;
    error: string | null;

    // Actions (state'i değiştiren fonksiyonlar)
    setCity: (city: string) => void;
    setInterests: (interests: string[]) => void;
    setStops: (stops: number) => void;
    setMode: (mode: TravelMode) => void;
    setPlaces: (places: Place[]) => void;
    setRoute: (route: RouteInfo | null) => void;
    setCurrentTripPlan: (plan: DetailedTripItinerary | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    resetTrip: () => void;
}

// Initial state (başlangıç değerleri)
const initialState = {
    city: "İstanbul",
    interests: ["museum"],
    stops: 4,
    mode: "walk" as TravelMode,
    places: [],
    route: null,
    currentTripPlan: null,
    isLoading: false,
    error: null,
};

// Zustand store oluştur
export const useTripStore = create<TripState>((set) => ({
    // Initial state'i yay
    ...initialState,

    // Actions - State'i değiştiren fonksiyonlar
    setCity: (city) => set({ city }),
    setInterests: (interests) => set({ interests }),
    setStops: (stops) => set({ stops }),
    setMode: (mode) => set({ mode }),
    setPlaces: (places) => set({ places }),
    setRoute: (route) => set({ route }),
    setCurrentTripPlan: (plan) => set({ currentTripPlan: plan }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Her şeyi sıfırla
    resetTrip: () => set(initialState),
}));
