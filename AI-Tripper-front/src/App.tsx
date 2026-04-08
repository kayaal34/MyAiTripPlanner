import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/home"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));
const SavedTrips = lazy(() => import("./pages/SavedTrips"));
const Settings = lazy(() => import("./pages/Settings"));
const History = lazy(() => import("./pages/History"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Destinations = lazy(() => import("./pages/Destinations"));
const TripPlanResult = lazy(() => import("./pages/TripPlanResult"));
const Success = lazy(() => import("./pages/Success"));

export default function App() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/90 px-8 py-7 shadow-xl border border-slate-100">
              <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading page...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/trip-plan" element={<TripPlanResult />} />
          <Route path="/saved-trips" element={<SavedTrips />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
        </Routes>
      </Suspense>
    </div>
  );
}
