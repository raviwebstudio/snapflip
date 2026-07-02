import { useRef, useState } from 'react'
import { Music, Pause, Play } from 'lucide-react'
import { musicTracks } from '../data/demoContent.js'

function MusicPicker({ selectedTrack, onChange }) {
  const audioRef = useRef(null)
  const [playingId, setPlayingId] = useState(null)

  const selectedId = typeof selectedTrack === 'object' ? selectedTrack?.id : selectedTrack;

  const togglePreview = (track) => {
    if (!track.file) {
      return
    }

    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }

    audioRef.current.src = `/music/${track.file}`
    audioRef.current.currentTime = 0
    audioRef.current.play().then(() => {
      setPlayingId(track.id)
      window.setTimeout(() => {
        audioRef.current?.pause()
        setPlayingId(null)
      }, 10000)
    }).catch(() => setPlayingId(null))
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {musicTracks.map((track) => {
        const isSelected = selectedId === track.id

        return (
          <div
            key={track.id}
            onClick={() => onChange?.(track)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onChange?.(track)
              }
            }}
            role="button"
            tabIndex={0}
            className={`flex items-center gap-3 rounded-xl p-4 text-left transition hover:border-sky-300/70 cursor-pointer ${
              isSelected
                ? 'border-2 border-sky-400 bg-sky-400/10'
                : 'border border-white/10 bg-white/5'
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sky-300">
              <Music size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{track.name}</span>
              <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                {track.category}
              </span>
            </span>
            {track.file && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  togglePreview(track)
                }}
                className="icon-button shrink-0"
                aria-label={`Preview ${track.name}`}
              >
                {playingId === track.id ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
          </div>
        )
      })}
      <audio ref={audioRef} />
    </div>
  )
}

export default MusicPicker
