import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Copy, Share2 } from 'lucide-react'
import FlipbookViewer from '../components/FlipbookViewer.jsx'
import { findAlbum, publicAlbumUrl } from '../lib/albums.js'

function PublicAlbum() {
  const { slug } = useParams()
  const [album, setAlbum] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setAlbum(findAlbum(slug))
  }, [slug])

  if (!album) {
    return (
      <main className="grid min-h-svh place-items-center px-4 text-center text-white">
        <div>
          <h1 className="font-display text-4xl font-bold">Album not found</h1>
          <Link to="/" className="primary-button mx-auto mt-6 w-fit">
            Create yours at SnapFlip.in
          </Link>
        </div>
      </main>
    )
  }

  const url = publicAlbumUrl(album.slug)

  const copyLink = async () => {
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main className="min-h-svh px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 text-center">
          <p className="text-sm text-sky-300">{album.photographerName}</p>
          <h1 className="font-display mt-2 text-4xl font-bold">{album.title}</h1>
          {album.weddingDate && <p className="mt-1 text-slate-400">{album.weddingDate}</p>}
        </div>
        <FlipbookViewer
          images={album.photos}
          musicFile={album.music?.file}
          title={album.title}
          photographerName={album.photographerName}
          isPublic
        />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Here's your wedding album\nView it here: ${url}\nCreated with SnapFlip`)}`}
            target="_blank"
            rel="noreferrer"
            className="primary-button"
          >
            <Share2 size={17} />
            WhatsApp
          </a>
          <button type="button" onClick={copyLink} className="secondary-button">
            <Copy size={16} />
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
        <footer className="py-8 text-center text-sm text-slate-400">
          <Link to="/" className="hover:text-white">Create your own at SnapFlip.in</Link>
        </footer>
      </section>
    </main>
  )
}

export default PublicAlbum
