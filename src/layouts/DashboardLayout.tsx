import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  let pageTitle = "Dashboard";
  if (location.pathname.startsWith("/create")) {
    pageTitle = "Create Album";
  } else if (location.pathname.startsWith("/settings")) {
    pageTitle = "Settings";
  } else if (location.pathname.startsWith("/analytics")) {
    pageTitle = "Analytics";
  } else if (location.pathname.startsWith("/pricing")) {
    pageTitle = "Pricing Plans";
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar (Left side, hidden on mobile) */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Drawer Panel (collapsible sidebar) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main panel area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar title={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Outlet scroll container */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
