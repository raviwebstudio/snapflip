import { Link } from "react-router-dom";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Dynamic background glow accents */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-2xl border border-slate-900 bg-slate-950/80 backdrop-blur-md p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top visual decoration */}
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 font-mono text-xl font-bold animate-pulse">
          404
        </div>

        <div className="space-y-2 relative z-10">
          <h1 className="text-xl font-extrabold text-slate-100 uppercase tracking-widest">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-900/60 flex flex-col gap-3 relative z-10">
          <Link
            to="/dashboard?tab=albums"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-colors cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Link>

          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4 text-sky-400" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
