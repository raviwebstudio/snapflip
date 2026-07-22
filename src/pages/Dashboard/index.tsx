import { useSearchParams } from "react-router-dom";
import Welcome from "../../components/dashboard/Welcome";
import Stats from "../../components/dashboard/Stats";
import RecentAlbums from "../../components/dashboard/RecentAlbums";
import StorageActivity from "../../components/dashboard/StorageActivity";
import TrashAlbums from "../../components/dashboard/TrashAlbums";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-900 gap-6">
        <button
          onClick={() => handleTabChange("overview")}
          className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "text-sky-400 border-sky-400"
              : "text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleTabChange("albums")}
          className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === "albums"
              ? "text-sky-400 border-sky-400"
              : "text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          Albums
        </button>
        <button
          onClick={() => handleTabChange("trash")}
          className={`pb-4 text-xs font-bold tracking-widest uppercase transition-all border-b-2 cursor-pointer ${
            activeTab === "trash"
              ? "text-sky-400 border-sky-400"
              : "text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          Trash
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <Welcome />
          <Stats />
          <StorageActivity />
        </div>
      )}

      {activeTab === "albums" && (
        <div className="space-y-8">
          <RecentAlbums />
        </div>
      )}

      {activeTab === "trash" && (
        <div className="space-y-8">
          <TrashAlbums />
        </div>
      )}
    </div>
  );
}

