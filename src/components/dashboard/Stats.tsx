import { useState, useEffect } from "react";
import { Library, Image, Eye, HardDrive } from "lucide-react";
import { DbService } from "../../services/dbService";

export default function Stats() {
  const [albums, setAlbums] = useState<any[]>([]);

  const loadStats = async () => {
    try {
      const list = await DbService.getAlbums();
      setAlbums(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
    
    const handleStorageChange = () => {
      loadStats();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const totalAlbums = albums.length;
  const totalPhotos = albums.reduce((sum, album) => sum + album.photos.length, 0);
  
  // Calculate mock views: 120 per published album + 15 per photo; drafts get 2 views per photo
  const totalViews = albums.reduce((sum, album) => {
    if (album.status === "Published") {
      return sum + 120 + (album.photos.length * 15);
    }
    return sum + (album.photos.length * 2);
  }, 0);

  // Storage size: average 3.2MB per photo
  const storageMB = totalPhotos * 3.2;
  const storageUsedStr = storageMB >= 1024 
    ? `${(storageMB / 1024).toFixed(1)} GB`
    : `${storageMB.toFixed(1)} MB`;

  const statsList = [
    {
      label: "Total Albums",
      value: totalAlbums.toString(),
      icon: Library,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      label: "Total Photos",
      value: totalPhotos.toLocaleString(),
      icon: Image,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Views",
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Storage Used",
      value: storageUsedStr,
      icon: HardDrive,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsList.map((stat) => {
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
              <span className="text-xl sm:text-2xl font-bold text-slate-100 block">
                {stat.value}
              </span>
            </div>
            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
