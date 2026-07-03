import Welcome from "../../components/dashboard/Welcome";
import Stats from "../../components/dashboard/Stats";
import RecentAlbums from "../../components/dashboard/RecentAlbums";
import StorageActivity from "../../components/dashboard/StorageActivity";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Welcome />
      <Stats />
      <RecentAlbums />
      <StorageActivity />
    </div>
  );
}

