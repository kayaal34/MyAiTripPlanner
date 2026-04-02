import clsx from "clsx";
import { useTripStore } from "../store/useTripStore";

interface RouteSummaryCardProps {
    className?: string;
}

export default function RouteSummaryCard({ className }: RouteSummaryCardProps) {
    const formData = useTripStore((state) => state.currentTripFormData);
    const tripPlan = useTripStore((state) => state.currentTripPlan);

    if (!formData || !tripPlan) {
        return null;
    }

    const days = tripPlan.trip_summary?.duration_days || formData.days;

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
                {formData.city}
            </h3>

            <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                    <dt>Gun</dt>
                    <dd>{days} gun</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>İlgi Alanı</dt>
                    <dd className="truncate">{formData.interests.join(", ")}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Yolcu</dt>
                    <dd>{formData.travelers}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Butce</dt>
                    <dd>{formData.budget}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                    <dt>Ulasim</dt>
                    <dd>{formData.transport || "farketmez"}</dd>
                </div>
            </dl>

            <button className="mt-5 w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600">
                GPX olarak indir
            </button>
        </div>
    );
}
