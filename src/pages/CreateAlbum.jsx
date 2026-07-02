import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ImagePlus, Trash2, Upload } from 'lucide-react'
import axios from 'axios'
import FlipbookViewer from '../components/FlipbookViewer.jsx'
import MusicPicker from '../components/MusicPicker.jsx'
import Navbar from '../components/Navbar.jsx'
import QRCodeCard from '../components/QRCodeCard.jsx'
import { musicTracks } from '../data/demoContent.js'
import { makeSlug, publicAlbumUrl, saveAlbum } from '../lib/albums.js'

function CreateAlbum() {
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState([])
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [music, setMusic] = useState(musicTracks[0])
  const [publishedAlbum, setPublishedAlbum] = useState(null)

  const canContinue = useMemo(() => {
    return photos.length >= 5 && photos.every((p) => p.status === 'success')
  }, [photos])

  const publishUrl = useMemo(
    () => (publishedAlbum ? publicAlbumUrl(publishedAlbum.slug) : ''),
    [publishedAlbum],
  )

  const uploadPhoto = async (photo) => {
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'snapflip_preset'
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lbchngyv'
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

    const formData = new FormData()
    formData.append('file', photo.file)
    formData.append('upload_preset', preset)

    setPhotos((current) =>
      current.map((p) => (p.id === photo.id ? { ...p, status: 'uploading', progress: 0 } : p))
    )

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setPhotos((current) =>
            current.map((p) => (p.id === photo.id ? { ...p, progress: percent } : p))
          )
        },
      })

      const secureUrl = response.data.secure_url

      setPhotos((current) =>
        current.map((p) =>
          p.id === photo.id ? { ...p, status: 'success', url: secureUrl, progress: 100 } : p
        )
      )
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      setPhotos((current) =>
        current.map((p) =>
          p.id === photo.id ? { ...p, status: 'error', error: err.message || 'Upload failed' } : p
        )
      )
    }
  }

  const addFiles = (files) => {
    const acceptedFiles = Array.from(files)
      .filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      .slice(0, 100 - photos.length)

    const newPhotos = acceptedFiles.map((file) => {
      const id = `${file.name}-${file.lastModified}-${Math.random()}`
      return {
        id,
        name: file.name,
        file,
        url: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      }
    })

    setPhotos((current) => [...current, ...newPhotos])

    newPhotos.forEach((photo) => {
      uploadPhoto(photo)
    })
  }

  const removePhoto = (id) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id)
      if (target && target.url && target.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url)
      }
      return current.filter((photo) => photo.id !== id)
    })
  }

  const movePhoto = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= photos.length) {
      return
    }

    setPhotos((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return next
    })
  }

  const publishAlbum = () => {
    const album = {
      slug: makeSlug(title),
      title,
      clientName,
      weddingDate,
      photographerName: 'Ravi Studio',
      photos: photos.map((photo) => photo.url),
      music,
      isPublished: true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    }

    saveAlbum(album)
    setPublishedAlbum(album)
  }

  if (publishedAlbum) {
    return (
      <main className="min-h-svh text-white">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-500/20 text-green-300">
              <Check size={24} />
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold">Album Published!</h1>
            <p className="mt-3 break-all text-slate-300">{publishUrl}</p>
            <div className="mt-6">
              <QRCodeCard url={publishUrl} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Here's your wedding album\nView it here: ${publishUrl}\nCreated with SnapFlip`)}`}
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                Share on WhatsApp
              </a>
              <Link to="/dashboard" className="secondary-button">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-svh text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-300">Step {step} / 3</p>
            <h1 className="font-display mt-1 text-4xl font-bold">Create Album</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((item) => (
              <span key={item} className={`h-2 w-16 rounded-full ${item <= step ? 'bg-sky-400' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6">
          {step === 1 && (
            <div>
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  addFiles(event.dataTransfer.files)
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-sky-300/50 bg-white/5 p-10 text-center"
              >
                <ImagePlus size={34} className="text-sky-300" />
                <span className="mt-3 text-lg font-semibold">Drop your wedding photos here</span>
                <span className="mt-1 text-sm text-slate-400">JPG, PNG, WEBP. Add at least 5 photos.</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => addFiles(event.target.files)}
                  className="sr-only"
                />
              </label>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${photos.length ? (photos.filter((p) => p.status === 'success').length / photos.length) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Uploaded {photos.filter((p) => p.status === 'success').length} of {photos.length} photos
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <img src={photo.url} alt={photo.name} className="h-36 w-full object-cover" />
                    <div className="absolute inset-x-2 top-2 flex justify-between">
                      <button type="button" onClick={() => movePhoto(index, -1)} className="mini-button" aria-label="Move left">
                        <ArrowLeft size={14} />
                      </button>
                      <button type="button" onClick={() => removePhoto(photo.id)} className="mini-button" aria-label="Remove photo">
                        <Trash2 size={14} />
                      </button>
                      <button type="button" onClick={() => movePhoto(index, 1)} className="mini-button" aria-label="Move right">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    {/* Status overlay */}
                    {photo.status === 'uploading' && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                          <div
                            className="h-full rounded-full bg-sky-400 transition-all duration-300"
                            style={{ width: `${photo.progress}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-sky-200">
                          <span>Uploading...</span>
                          <span>{photo.progress}%</span>
                        </div>
                      </div>
                    )}
                    {photo.status === 'success' && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-green-500 p-1 text-white shadow-lg">
                        <Check size={14} />
                      </span>
                    )}
                    {photo.status === 'error' && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-950/80 px-2 py-1 text-center text-[10px] text-red-200 truncate">
                        Upload failed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-4">
                <label className="block">
                  <span className="form-label">Album Title</span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="form-input" required />
                </label>
                <label className="block">
                  <span className="form-label">Client Name</span>
                  <input value={clientName} onChange={(event) => setClientName(event.target.value)} className="form-input" />
                </label>
                <label className="block">
                  <span className="form-label">Wedding Date</span>
                  <input type="date" value={weddingDate} onChange={(event) => setWeddingDate(event.target.value)} className="form-input" />
                </label>
              </div>
              <MusicPicker selectedTrack={music} onChange={setMusic} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <FlipbookViewer
                images={photos.map((photo) => photo.url)}
                musicFile={music.file}
                title={title}
                photographerName={clientName || 'Preview'}
              />
              <p className="text-center text-sm text-slate-300">Selected music: {music.name}</p>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <button type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} className="secondary-button" disabled={step === 1}>
              <ArrowLeft size={16} />
              Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((value) => value + 1)}
                disabled={(step === 1 && !canContinue) || (step === 2 && !title.trim())}
                className="primary-button disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={publishAlbum} className="primary-button">
                <Upload size={16} />
                Publish Album
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CreateAlbum
