import { Link } from 'react-router-dom'
import { Copy, Eye, QrCode, Trash2 } from 'lucide-react'
import { publicAlbumUrl } from '../lib/albums.js'

function AlbumCard({ album, onDelete }) {
  const url = publicAlbumUrl(album.slug)

  const copy = async () => {
    await navigator.clipboard?.writeText(url)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-sky-300/50">
      <img src={album.photos?.[0]} alt={album.title} className="h-48 w-full object-cover" />
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-lg font-semibold text-white">{album.title}</h3>
            <span className="rounded-full bg-green-500/15 px-2 py-1 text-xs text-green-300">Published</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{album.clientName || 'Wedding client'}</p>
          <p className="text-xs text-slate-500">{album.weddingDate || 'Date not set'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Eye size={16} />
          {album.viewCount || 0} views
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Link to={`/view/${album.slug}`} className="secondary-button justify-center">
            Open
          </Link>
          <button type="button" onClick={copy} className="icon-button" aria-label="Copy link">
            <Copy size={16} />
          </button>
          <button type="button" onClick={copy} className="icon-button" aria-label="Copy QR link">
            <QrCode size={16} />
          </button>
          <button type="button" onClick={() => onDelete(album.slug)} className="danger-button" aria-label="Delete album">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default AlbumCard
