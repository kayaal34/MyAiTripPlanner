import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TripPlanResult from "./pages/TripPlanResult_NEW";
import AdminMessages from "./pages/AdminMessages";
import SavedTrips from "./pages/SavedTrips";
import Settings from "./pages/Settings";
import History from "./pages/History";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trip-plan" element={<TripPlanResult />} />
        <Route path="/saved-trips" element={<SavedTrips />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
      </Routes>
    </div>
  );
}
