import { Bell, Search, Sun, Menu } from "lucide-react";

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  return (
    <header className="h-16 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider">{title}</h2>
      </div>

      {/* Right Side Options */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mock Search Bar */}
        <div className="hidden sm:flex items-center relative max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search albums..."
            className="h-9 w-60 pl-9 pr-4 rounded-xl border border-slate-900 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* UI Theme Toggle */}
          <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white transition-all">
            <Sun className="h-4.5 w-4.5 text-sky-400" />
          </button>

          {/* Notifications Icon */}
          <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-white relative transition-all">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-sky-400 border border-slate-950" />
          </button>
        </div>
      </div>
    </header>
  );
}
