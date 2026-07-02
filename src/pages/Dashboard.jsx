import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Crown, Eye, Images } from 'lucide-react'
import AlbumCard from '../components/AlbumCard.jsx'
import Navbar from '../components/Navbar.jsx'
import { deleteAlbum, getAlbums } from '../lib/albums.js'

function Dashboard() {
  const [albums, setAlbums] = useState([])

  useEffect(() => {
    setAlbums(getAlbums())
  }, [])

  const handleDelete = (slug) => {
    if (window.confirm('Delete this album?')) {
      setAlbums(deleteAlbum(slug))
    }
  }

  const totalViews = albums.reduce((sum, album) => sum + (album.viewCount || 0), 0)

  return (
    <main className="min-h-svh text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-300">Photographer Home</p>
            <h1 className="font-display mt-1 text-4xl font-bold">Dashboard</h1>
          </div>
          <Link to="/create" className="primary-button">
            <Camera size={18} />
            Create Album
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-400/10 p-4 text-sky-100">
          <strong>Upgrade to Pro</strong> for unlimited albums, music, and no watermark.
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [Images, albums.length, 'Total Albums'],
            [Eye, totalViews, 'Total Views'],
            [Crown, 'Free', 'Current Plan'],
          ].map(([Icon, value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Icon className="text-sky-300" size={24} />
              <p className="mt-4 text-3xl font-semibold">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {albums.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <Camera className="mx-auto text-sky-300" size={42} />
            <h2 className="mt-4 text-2xl font-semibold">Create your first flipbook in 2 minutes</h2>
            <Link to="/create" className="primary-button mx-auto mt-5 w-fit">
              Create Album
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <AlbumCard key={album.slug} album={album} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Dashboard
