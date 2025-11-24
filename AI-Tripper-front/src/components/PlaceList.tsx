import { useTripStore } from "../store/useTripStore";

export default function PlaceList() {
  const places = useTripStore((state) => state.places);

  if (!places.length)
    return (
      <p className="text-sm text-slate-500">
        Henüz önerilen bir yer yok. Rota oluşturun.
      </p>
    );

  return (
    <div className="space-y-3">
      {places.map((p, i) => (
        <div
          key={p.id || i}
          className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
        >
          <p className="text-lg font-semibold">{p.name}</p>
          <p className="text-sm text-slate-500">
            Lat: {p.lat.toFixed(4)} | Lng: {p.lon.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  );
}
