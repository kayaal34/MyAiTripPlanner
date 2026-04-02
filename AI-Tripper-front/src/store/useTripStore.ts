import { create } from "zustand";
import type { DetailedTripItinerary } from "../services/api";

// Store'da tutacağımız state'in type'ı
interface TripState {
    // AI Trip Planner state
    currentTripPlan: DetailedTripItinerary | null;
    currentTripFormData: {
        city: string;
        days: number;
        travelers: string;
        interests: string[];
        budget: string;
        transport?: string;
    } | null;

    // Loading/Error durumları
    isLoading: boolean;
    error: string | null;

    // Actions (state'i değiştiren fonksiyonlar)
    setCurrentTripPlan: (plan: DetailedTripItinerary | null) => void;
    setCurrentTripFormData: (data: TripState['currentTripFormData']) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    resetTrip: () => void;
}

// Initial state (başlangıç değerleri)
const initialState = {
    currentTripPlan: null,
    currentTripFormData: null,
    isLoading: false,
    error: null,
};

// Zustand store oluştur
export const useTripStore = create<TripState>((set) => ({
    // Initial state'i yay
    ...initialState,

    // Actions - State'i değiştiren fonksiyonlar
    setCurrentTripPlan: (plan) => set({ currentTripPlan: plan }),
    setCurrentTripFormData: (data) => set({ currentTripFormData: data }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Her şeyi sıfırla
    resetTrip: () => set(initialState),
}));
