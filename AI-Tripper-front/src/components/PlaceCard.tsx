import type { Place } from "../type";

interface PlaceCardProps {
    place: Place;
    isActive?: boolean;
    onHover?: (id: string | null) => void;
}

export default function PlaceCard({
    place,
    isActive = false,
    onHover,
}: PlaceCardProps) {
    return (
        <article
            onMouseEnter={() => onHover?.(place.id)}
            onMouseLeave={() => onHover?.(null)}
            className={`rounded-2xl border p-4 transition ${isActive
                ? "border-emerald-500 bg-emerald-50 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
                }`}
        >
            <header className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">
                    {place.name}
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {place.interest}
                </span>
            </header>
            <p className="mt-2 text-sm text-slate-600">{place.description}</p>
            <div className="mt-3 text-xs font-medium text-slate-500">
                {place.lat.toFixed(4)}°N • {place.lon.toFixed(4)}°E
            </div>
        </article>
    );
}
