import { Link, useLocation } from "react-router-dom";
import { Camera, LayoutDashboard, PlusCircle, BarChart3, CreditCard, Settings } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Create Album", path: "/create", icon: PlusCircle },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Pricing", path: "/pricing", icon: CreditCard },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-[#0B3037] text-white">
              <Camera className="h-5 w-5" />
            </div>
            Snap<span className="text-sky-400">Flip</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0B3037]/45 text-sky-400 border-l-2 border-sky-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile info footer in sidebar */}
      <Link
        to="/settings"
        onClick={onClose}
        className={`border-t border-slate-900 pt-6 flex items-center gap-3 group transition-all duration-200 cursor-pointer ${
          location.pathname === "/settings" ? "opacity-100" : "opacity-85 hover:opacity-100"
        }`}
      >
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0B3037] to-sky-500 flex items-center justify-center text-xs font-bold text-white uppercase group-hover:scale-[1.05] transition-transform duration-200 shrink-0">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-sky-400 transition-colors">John Doe</p>
          <p className="text-[10px] text-slate-500 truncate">john@aurastudios.com</p>
        </div>
      </Link>
    </aside>
  );
}
