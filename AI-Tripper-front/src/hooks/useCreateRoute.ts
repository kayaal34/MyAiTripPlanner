import { useMutation } from "@tanstack/react-query";
import { ApiError } from "../services/api";
import { useTripStore } from "../store/useTripStore";

type LegacyRouteRequest = {
    city: string;
    interests: string[];
    stops: number;
    mode: "walk" | "drive";
};

/**
 * React Query hook - Backend'e rota isteği atmak için
 * 
 * Kullanımı:
 * const { mutate, isPending, error } = useCreateRoute();
 * mutate({ city, interests, stops, mode });
 * 
 * Başarılı olursa:
 * - Store'a places ve route kaydedilir
 * - isLoading false olur
 * 
 * Hata olursa:
 * - Store'a error mesajı kaydedilir
 * - isLoading false olur
 */
export function useCreateRoute() {
    const setIsLoading = useTripStore((state) => state.setIsLoading);
    const setError = useTripStore((state) => state.setError);

    return useMutation<never, ApiError, LegacyRouteRequest>({
        mutationFn: async () => {
            throw new ApiError(
                "Legacy route endpoint has been removed. Use createDetailedTripPlan instead."
            );
        },

        // İstek başlamadan önce
        onMutate: () => {
            setIsLoading(true);
            setError(null);
        },

        // Başarılı olursa
        onSuccess: () => {
            setIsLoading(false);
            setError(null);
        },

        // Hata olursa
        onError: (error) => {
            setIsLoading(false);
            setError(error.message);
            console.error("Route creation failed:", error);
        },
    });
}
