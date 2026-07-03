import { Link } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";

export default function Welcome() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#0B3037]/50 bg-gradient-to-br from-[#0B3037]/25 via-[#041215] to-slate-950 p-6 sm:p-8 shadow-xl">
      {/* Light glow overlay */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-sky-500/5 blur-[50px] pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-semibold text-sky-400 border border-sky-400/10">
            <Sparkles className="h-3 w-3" />
            <span>Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, John!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Your photography portfolios are looking great. You have 4 active digital flipbooks running. Update your galleries, track live view counts, or share secure client links below.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 transition-all shadow-md shadow-sky-500/5 hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" />
          Create Album
        </Link>
      </div>
    </div>
  );
}
