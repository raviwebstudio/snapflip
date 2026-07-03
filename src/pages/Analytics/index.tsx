import { BarChart3, Eye, Users, Clock, Share2, TrendingUp } from "lucide-react";

export default function Analytics() {
  const stats = [
    { label: "Total Page Views", value: "1,205", change: "+12.5%", icon: Eye, color: "text-sky-400" },
    { label: "Unique Visitors", value: "482", change: "+8.3%", icon: Users, color: "text-emerald-400" },
    { label: "Avg. Viewing Time", value: "4m 32s", change: "+18.1%", icon: Clock, color: "text-purple-400" },
    { label: "Total Shares", value: "94", change: "+4.2%", icon: Share2, color: "text-amber-400" },
  ];

  const popularAlbums = [
    { name: "Wedding Collection", views: 642, visitors: 280, duration: "5m 12s" },
    { name: "Pre Wedding", views: 324, visitors: 112, duration: "3m 45s" },
    { name: "Reception Collection", views: 184, visitors: 72, duration: "4m 10s" },
    { name: "Portfolio Showcase", views: 55, visitors: 18, duration: "2m 50s" },
  ];

  const monthlyData = [
    { month: "Jan", views: 180 },
    { month: "Feb", views: 290 },
    { month: "Mar", views: 420 },
    { month: "Apr", views: 380 },
    { month: "May", views: 510 },
    { month: "Jun", views: 642 },
  ];

  const maxViews = Math.max(...monthlyData.map((d) => d.views));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Dynamic Header */}
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-sky-400" />
          Analytics Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track visitor interactions, viewing times, and sharing statistics for your portfolios.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-900 bg-slate-950 p-5 flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-slate-100">
                    {stat.value}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 font-mono">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`h-10 w-10 shrink-0 rounded-xl bg-slate-900 flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Popular List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Chart Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Visitor Trends</h3>
              <p className="text-[10px] text-slate-500">Monthly page view progression (last 6 months).</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <TrendingUp className="h-3 w-3" />
              <span>Upward Trend</span>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 border-b border-slate-900/60 pb-2">
            {monthlyData.map((d) => {
              const pct = (d.views / maxViews) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.views}
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden relative min-h-[4px] h-full flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#0B3037] to-sky-500 transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Albums list */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Top Collections</h3>
            <p className="text-[10px] text-slate-500">Most visited albums in your workspace.</p>
          </div>

          <div className="space-y-4">
            {popularAlbums.map((album) => (
              <div key={album.name} className="flex justify-between items-center py-2 border-b border-slate-900/40 last:border-0">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200 truncate max-w-[150px]">{album.name}</h4>
                  <span className="text-[9px] font-mono text-slate-500">{album.duration} avg view</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-300">{album.views} views</span>
                  <p className="text-[9px] font-mono text-slate-500">{album.visitors} visitors</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
