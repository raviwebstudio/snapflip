import { useState, useEffect } from "react";
import { HardDrive, Share2, RefreshCw, Plus } from "lucide-react";
import { DbService } from "../../services/dbService";

export default function StorageActivity() {
  const [albums, setAlbums] = useState(() => DbService.getAlbums());

  useEffect(() => {
    const handleStorageChange = () => {
      setAlbums(DbService.getAlbums());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const totalPhotos = albums.reduce((sum, album) => sum + album.photos.length, 0);
  const storageGB = (totalPhotos * 3.2) / 1024; // 3.2MB per photo
  const storageUsedStr = storageGB >= 1.0 
    ? `${storageGB.toFixed(2)} GB`
    : `${(storageGB * 1024).toFixed(1)} MB`;
  
  const percentageUsed = Math.min((storageGB / 100) * 100, 100);
  const percentageStr = `${Math.max(percentageUsed, 0.1).toFixed(2)}%`;

  // Dynamically generate activity items based on real albums
  const activities = albums.length > 0 ? albums.slice(0, 4).map((album, idx) => {
    const isPublished = album.status === "Published";
    const title = isPublished ? "Album Shared & Published" : "Album Edited / Created";
    const meta = isPublished 
      ? `Showcase live for ${album.name} (${album.photos.length} photos)`
      : `Staged progress for ${album.name} (Client: ${album.coupleName || "couple"})`;
    const time = idx === 0 ? "Just now" : idx === 1 ? "2 hours ago" : `${idx * 2} days ago`;
    const icon = isPublished ? Share2 : idx % 2 === 0 ? Plus : RefreshCw;
    const color = isPublished 
      ? "text-purple-400 bg-purple-500/10" 
      : idx % 2 === 0 
        ? "text-sky-400 bg-sky-500/10" 
        : "text-amber-400 bg-amber-500/10";
    
    return { title, meta, time, icon, color };
  }) : [
    {
      title: "Workspace Initialized",
      meta: "No active collections found. Create a new album to begin.",
      time: "1 day ago",
      icon: Plus,
      color: "text-slate-400 bg-slate-900/60",
    }
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
            <span className="text-slate-300 font-bold">{storageUsedStr} used</span>
            <span className="text-slate-500">of 100 GB limit</span>
          </div>
          {/* Progress bar container */}
          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            {/* Progress bar fill */}
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-[#0B3037] transition-all duration-500" 
              style={{ width: `${percentageUsed}%` }} 
            />
          </div>
        </div>

        <div className="border-t border-slate-900 pt-4 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Usage: {percentageStr}</span>
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
              <div key={index} className="flex gap-4 items-start relative animate-fade-in">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-900 relative z-10 ${act.color}`}>
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
