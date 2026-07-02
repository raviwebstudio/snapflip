import { useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Maximize2, Pause, Play, Share2, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { PageFlip } from 'page-flip'
import { demoImages, musicTracks } from '../data/demoContent.js'

const defaultCaptions = ['Ceremony', 'Portraits', 'Family', 'Details', 'First Dance']

function FlipbookViewer({
  images = demoImages,
  musicFile = null,
  title = 'SnapFlip Wedding Album',
  isPublic: _isPublic = false,
  photographerName = 'SnapFlip Studio',
  className = '',
}) {
  const bookRef = useRef(null)
  const shellRef = useRef(null)
  const pageFlipRef = useRef(null)
  const audioRef = useRef(null)
  const turnAudioRef = useRef(null)
  const hasStartedRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.65)
  const [copyLabel, setCopyLabel] = useState('Copy')

  const pages = useMemo(
    () =>
      images.map((image, index) => ({
        image,
        title: defaultCaptions[index % defaultCaptions.length],
        location: index === 0 ? title : photographerName,
      })),
    [images, photographerName, title],
  )

  const track = musicTracks.find((item) => item.file === musicFile || item.id === musicFile)
  const resolvedFile = track?.file || musicFile
  const audioSource = resolvedFile ? `/music/${resolvedFile}` : null

  useEffect(() => {
    if (!bookRef.current || pageFlipRef.current) {
      return undefined
    }

    const pageFlip = new PageFlip(bookRef.current, {
      width: 420,
      height: 560,
      minWidth: 280,
      maxWidth: 420,
      minHeight: 373,
      maxHeight: 560,
      size: 'stretch',
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: 900,
      mobileScrollSupport: false,
      usePortrait: true,
      startZIndex: 10,
    })

    pageFlip.loadFromHTML(bookRef.current.querySelectorAll('[data-page]'))
    pageFlip.on('flip', (event) => {
      setCurrentPage(event.data + 1)
      if (turnAudioRef.current) {
        turnAudioRef.current.currentTime = 0
        turnAudioRef.current.play().catch(() => {})
      }
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true)
            hasStartedRef.current = true
          })
          .catch(() => {})
      }
    })
    pageFlipRef.current = pageFlip

    return () => {
      pageFlip.destroy()
      pageFlipRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const startMusic = () => {
    if (audioRef.current && !hasStartedRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          hasStartedRef.current = true
        })
        .catch((err) => {
          console.error("Audio autoplay failed:", err)
        })
    }
  }

  const handlePrevious = () => {
    pageFlipRef.current?.flipPrev()
  }

  const handleNext = () => {
    pageFlipRef.current?.flipNext()
  }

  const toggleMusic = () => {
    if (!audioRef.current) {
      return
    }

    if (audioRef.current.paused) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          hasStartedRef.current = true
        })
        .catch(() => {})
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setCopyLabel('Copied')
    window.setTimeout(() => setCopyLabel('Copy'), 1500)
  }

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`Here's your wedding album\nView it here: ${window.location.href}\nCreated with SnapFlip`)
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      shellRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <section
      ref={shellRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#102E33]/75 p-4 text-white shadow-2xl shadow-black/25 backdrop-blur-md sm:p-6 ${className}`}
      onClick={startMusic}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(56,189,248,0.18),transparent_30rem)]" />
      <div className="relative flex min-h-full w-full flex-col items-center justify-between gap-5">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-[#38BDF8]">SnapFlip Album</p>
            <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Page <span className="font-semibold text-white">{currentPage}</span> of {pages.length}
          </div>
        </div>

        <div className="relative w-full max-w-[860px] overflow-hidden rounded-xl border border-white/10 bg-black/15 p-3 sm:p-5">
          <div ref={bookRef} className="mx-auto">
            {pages.map((page, index) => (
              <article
                className="relative h-full w-full overflow-hidden bg-[#102E33]"
                data-density={index === 0 || index === pages.length - 1 ? 'hard' : 'soft'}
                data-page
                key={`${page.image}-${index}`}
              >
                <img
                  src={page.image}
                  alt={page.title}
                  className="h-full w-full object-cover"
                  draggable="false"
                />
              </article>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={handlePrevious} className="primary-button" aria-label="Previous page">
            <SkipBack size={18} />
          </button>
          <button type="button" onClick={handleNext} className="primary-button">
            <SkipForward size={18} />
            Next
          </button>
          <button type="button" onClick={toggleFullscreen} className="icon-button" aria-label="Fullscreen">
            <Maximize2 size={18} />
          </button>
          <button type="button" onClick={copyLink} className="secondary-button">
            <Copy size={16} />
            {copyLabel}
          </button>
          <button type="button" onClick={shareToWhatsApp} className="secondary-button">
            <Share2 size={16} />
            WhatsApp
          </button>
        </div>

        {audioSource && (
          <div className="flex w-full max-w-2xl flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center">
            <button type="button" onClick={toggleMusic} className="icon-button" aria-label="Toggle music">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{track?.name || 'Selected music'}</p>
              <p className="text-xs text-slate-400">Music starts after the first click or tap</p>
            </div>
            <label className="flex items-center gap-2 text-slate-300">
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-28 accent-sky-400"
                aria-label="Music volume"
              />
            </label>
          </div>
        )}
      </div>
      <audio ref={turnAudioRef} src="/sounds/page-turn.mp3" preload="auto" />
      {audioSource && (
        <audio ref={audioRef} src={audioSource} loop />
      )}
    </section>
  )
}

export default FlipbookViewer
