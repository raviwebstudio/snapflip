import { Outlet } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
