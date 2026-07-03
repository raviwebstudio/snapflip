import { HardDrive, Upload, Share2, RefreshCw, Plus } from "lucide-react";

export default function StorageActivity() {
  const activities = [
    {
      title: "Album Created",
      meta: "Wedding Collection created",
      time: "2 hours ago",
      icon: Plus,
      color: "text-sky-400 bg-sky-500/10",
    },
    {
      title: "Photos Uploaded",
      meta: "Added 12 photos to Wedding Collection",
      time: "4 hours ago",
      icon: Upload,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      title: "Album Shared",
      meta: "Shared Pre Wedding view link with client",
      time: "1 day ago",
      icon: Share2,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      title: "Album Updated",
      meta: "Changed theme settings for Portfolio",
      time: "3 days ago",
      icon: RefreshCw,
      color: "text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Storage Card */}
      <div className="lg:col-span-1 rounded-2xl border border-slate-900 bg-slate-950 p-6 flex flex-col justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <HardDrive className="h-4.5 w-4.5 text-sky-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Storage Status</h4>
          </div>
          <p className="text-xs text-slate-500">Includes raw photo uploads and generated digital flipbook files.</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="text-slate-300">12.4 GB used</span>
            <span className="text-slate-500">of 100 GB</span>
          </div>
          {/* Progress bar container */}
          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            {/* Progress bar fill */}
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-[#0B3037]" style={{ width: "12.4%" }} />
          </div>
        </div>

        <div className="border-t border-slate-900 pt-4 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Usage: 12.4%</span>
          <span>Workspace Plan</span>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950 p-6 space-y-6 shadow-lg">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Recent Workspace Activity</h4>
          <p className="text-xs text-slate-500">Timeline of updates across your collections and links.</p>
        </div>

        <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-900">
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <div key={index} className="flex gap-4 items-start relative">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-950 relative z-10 ${act.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-baseline gap-4">
                    <h5 className="text-sm font-bold text-slate-200">{act.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-400">{act.meta}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
