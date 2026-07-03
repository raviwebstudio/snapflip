import { Link } from "react-router-dom";
import { Plus, Image, Calendar, MoreVertical, ExternalLink } from "lucide-react";

export default function RecentAlbums() {
  const albums = [
    {
      name: "Wedding Collection",
      photos: 82,
      updated: "2 hours ago",
      status: "Published",
      gradient: "from-[#0b3037] to-slate-900",
    },
    {
      name: "Pre Wedding",
      photos: 48,
      updated: "1 day ago",
      status: "Published",
      gradient: "from-[#051a24] to-slate-900",
    },
    {
      name: "Reception",
      photos: 65,
      updated: "3 days ago",
      status: "Draft",
      gradient: "from-purple-950/40 to-slate-900",
    },
    {
      name: "Portfolio Collection",
      photos: 45,
      updated: "1 week ago",
      status: "Published",
      gradient: "from-slate-900 to-slate-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-widest">Recent Collections</h3>
        <Link to="/dashboard?tab=albums" className="text-xs text-sky-400 hover:text-sky-300 font-medium">
          View all collections
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Album Card */}
        <Link
          to="/create"
          className="relative group rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-sky-500/50 p-6 flex flex-col justify-center items-center gap-3 text-center min-h-[220px] transition-all hover:scale-[1.01]"
        >
          <div className="h-12 w-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-sky-400 group-hover:border-sky-400/35 transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Create New Album</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[180px] mx-auto">Upload files or drag templates to begin.</p>
          </div>
        </Link>

        {/* Mock Albums */}
        {albums.map((album) => (
          <div
            key={album.name}
            className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden flex flex-col justify-between min-h-[220px] shadow-lg group hover:border-[#0B3037]/60 transition-all hover:scale-[1.01]"
          >
            {/* Mock Cover Image */}
            <div className={`h-24 bg-gradient-to-br ${album.gradient} relative p-4 flex items-start justify-between border-b border-slate-900/60`}>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                album.status === "Published"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}>
                {album.status}
              </span>
              
              <div className="flex gap-2">
                <button className="h-7 w-7 rounded-lg bg-slate-950/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button className="h-7 w-7 rounded-lg bg-slate-950/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Album details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors truncate">
                  {album.name}
                </h4>
                <div className="flex items-center gap-2 text-slate-400 mt-2 text-xs">
                  <Image className="h-3.5 w-3.5 text-slate-500" />
                  <span>{album.photos} photos</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-900 mt-4 text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{album.updated}</span>
                </div>
                <span>Collection</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
