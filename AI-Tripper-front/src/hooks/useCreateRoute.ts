import { useMutation } from "@tanstack/react-query";
import { fetchRoute, type RouteRequest, type RouteResponse, ApiError } from "../services/api";
import { useTripStore } from "../store/useTripStore";

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
    // Store'dan setter fonksiyonları al
    const setPlaces = useTripStore((state) => state.setPlaces);
    const setRoute = useTripStore((state) => state.setRoute);
    const setIsLoading = useTripStore((state) => state.setIsLoading);
    const setError = useTripStore((state) => state.setError);

    return useMutation<RouteResponse, ApiError, RouteRequest>({
        // Mutation function - API çağrısı
        mutationFn: fetchRoute,

        // İstek başlamadan önce
        onMutate: () => {
            setIsLoading(true);
            setError(null);
        },

        // Başarılı olursa
        onSuccess: (data) => {
            setPlaces(data.places);
            setRoute(data.route);
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
