import clsx from "clsx";
import { useTripStore } from "../store/useTripStore";

interface RouteSummaryCardProps {
    className?: string;
}

export default function RouteSummaryCard({ className }: RouteSummaryCardProps) {
    // Zustand store'dan veri al
    const city = useTripStore((state) => state.city);
    const interests = useTripStore((state) => state.interests);
    const stops = useTripStore((state) => state.stops);
    const route = useTripStore((state) => state.route);

    // Eğer henüz rota yoksa gösterme
    if (!route) {
        return null;
    }

    const modeLabel = route.mode === "walk" ? "Yürüyüş" : "Araç";

    return (
        <div
            className={clsx(
                "w-64 rounded-2xl bg-white/80 p-5 shadow-2xl backdrop-blur-md",
                className,
            )}
        >
            <p className="text-xs uppercase tracking-wide text-slate-500">
                Rota Özeti
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {city}
            </h3>

            <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>Durak</dt>
                    <dd>{stops} nokta</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>İlgi Alanı</dt>
                    <dd className="truncate">{interests.join(", ")}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Mesafe</dt>
                    <dd>{route.distanceKm.toFixed(1)} km</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Süre</dt>
                    <dd>~{route.durationMinutes} dk</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Mod</dt>
                    <dd>{modeLabel}</dd>
                </div>
            </dl>

            <button className="mt-5 w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600">
                GPX olarak indir
            </button>
        </div>
    );
}
