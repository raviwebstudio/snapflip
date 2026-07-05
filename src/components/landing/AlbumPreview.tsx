import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Maximize2, RotateCcw } from "lucide-react";
import BookEngine, { type BookEngineRef } from "../viewer/BookEngine";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";

// Fallback constant for demo-album to ensure compiling & rendering even without DB init
const LOCAL_DEMO_ALBUM: Album = {
  id: "demo-album",
  name: "Wedding & Editorial Showcase",
  coupleName: "Charlotte & Daniel",
  eventType: "wedding",
  eventDate: "2026-06-28",
  photos: [
    { id: "d-1", url: "/demo-album/photo1.jpg", name: "ceremony-entrance.jpg", width: 800, height: 1200 },
    { id: "d-2", url: "/demo-album/photo2.jpg", name: "vows-exchange.jpg", width: 1200, height: 800 },
    { id: "d-3", url: "/demo-album/photo3.jpg", name: "bridal-portrait.jpg", width: 800, height: 1200 },
    { id: "d-4", url: "/demo-album/photo4.jpg", name: "reception-banquet.jpg", width: 1200, height: 800 },
    { id: "d-5", url: "/demo-album/photo5.jpg", name: "groom-portrait.jpg", width: 800, height: 1200 },
    { id: "d-6", url: "/demo-album/photo6.jpg", name: "details-rings.jpg", width: 1000, height: 1000 },
    { id: "d-7", url: "/demo-album/photo7.jpg", name: "venue-decor.jpg", width: 1200, height: 800 },
    { id: "d-8", url: "/demo-album/photo8.jpg", name: "editorial-session.jpg", width: 800, height: 1200 },
    { id: "d-9", url: "/demo-album/photo9.jpg", name: "sunset-escape.jpg", width: 1200, height: 800 },
    { id: "d-10", url: "/demo-album/photo10.jpg", name: "bridal-veil-close.jpg", width: 800, height: 1200 }
  ],
  coverImage: "/demo-album/cover.jpg",
  settings: {
    title: "Showcase Album",
    description: "Charlotte & Daniel's Premium Photography Album Showcase.",
    theme: "dark-luxury",
    music: "fine-art",
    visibility: "Public",
    passcode: "",
    watermark: true,
    allowDownload: true,
    albumSize: "auto"
  },
  status: "Published",
  updated: "Just now",
  gradient: "from-[#0b3037] to-slate-900",
};

export default function AlbumPreview() {
  const bookEngineRef = useRef<BookEngineRef>(null);

  // Fetch from database if available, fallback to local constant
  const demoAlbum = useMemo(() => {
    try {
      const fetched = DbService.getAlbumById("demo-album");
      return fetched || LOCAL_DEMO_ALBUM;
    } catch {
      return LOCAL_DEMO_ALBUM;
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const totalPhotos = demoAlbum.photos.length;
  const hasFillerPage = (totalPhotos + 2) % 2 !== 0;
  const totalPages = totalPhotos + 2 + (hasFillerPage ? 1 : 0);

  // Disable autoplay immediately upon manual swipe/drag/click interaction
  const handleManualInteraction = () => {
    if (isAutoplayActive) {
      setIsAutoplayActive(false);
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  return (
    <section className="bg-slate-950 min-h-screen flex items-center py-20 sm:py-28 relative border-t border-slate-900/60 overflow-hidden">
      {/* Background accent lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[800px] rounded-full bg-[#0B3037]/15 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-sky-400">Interactive Showcase</h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            A Premium Physical-Feel Presentation
          </p>
          <p className="text-base text-slate-400">
            Click, drag, or let it play automatically to experience our custom GPU-accelerated 3D flipbook engine.
          </p>
        </div>

        {/* Live 3D Flipbook Demo Viewer */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-900 bg-slate-950/80 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-2xl shadow-sky-500/5 relative">
          
          {/* Top Control Bar */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Charlotte & Daniel's Wedding Book
              </span>
              {isAutoplayActive && !isHovered && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              )}
            </div>
            
            {/* Slideshow Play / Pause status badge */}
            <button
              onClick={() => setIsAutoplayActive(!isAutoplayActive)}
              className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              {isAutoplayActive ? (
                <>
                  <Pause className="h-3 w-3 text-sky-450" />
                  Slideshow: Playing
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-slate-550" />
                  Slideshow: Paused
                </>
              )}
            </button>
          </div>

          {/* Book Wrapper & Mouse Hover Listeners */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={handleManualInteraction}
            onTouchStart={handleManualInteraction}
            className="relative w-full flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-900 shadow-inner overflow-hidden"
            style={{ height: "420px" }}
          >
            <BookEngine
              ref={bookEngineRef}
              photos={demoAlbum.photos}
              albumSize="auto"
              albumTitle={demoAlbum.name}
              coupleName={demoAlbum.coupleName}
              watermark={demoAlbum.settings.watermark}
              watermarkText={demoAlbum.coupleName}
              coverImage={demoAlbum.coverImage}
              maxHeight="380px"
              onPageChange={handlePageChange}
              onInteraction={handleManualInteraction}
              autoPlay={isAutoplayActive && !isHovered}
            />
          </div>

          {/* Overlay notification when Autoplay is paused via manual interaction (stays outside the book container) */}
          {!isAutoplayActive && (
            <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-900 text-[10px] font-mono text-slate-350">
              <span>Manual mode active</span>
              <button
                onClick={() => setIsAutoplayActive(true)}
                className="px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
              >
                <Play className="h-2.5 w-2.5 fill-current" />
                Resume Slideshow
              </button>
            </div>
          )}

          {/* Bottom Flipbook Navigation Indicators & Restart control */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <button
              onClick={() => {
                handleManualInteraction();
                bookEngineRef.current?.flipPrev();
              }}
              disabled={currentPage === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-850 bg-slate-900/60 text-slate-450 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-xs font-mono font-semibold tracking-widest text-slate-455 select-none">
              {currentPage === 0 ? (
                "COVER PAGE"
              ) : currentPage >= totalPages - 1 ? (
                "BACK COVER"
              ) : (
                `SPREAD ${Math.floor((currentPage - 1) / 2) + 1} OF ${Math.floor((totalPages - 2) / 2) + 1}`
              )}
            </span>

            <button
              onClick={() => {
                handleManualInteraction();
                bookEngineRef.current?.flipNext();
              }}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-850 bg-slate-900/60 text-slate-450 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Next Page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Restart button if at the end */}
            {currentPage >= totalPages - 1 && (
              <button
                onClick={() => {
                  bookEngineRef.current?.reset();
                  setIsAutoplayActive(true);
                }}
                className="inline-flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl border border-slate-850 bg-slate-900/65 text-[10px] font-bold uppercase tracking-wider text-sky-400 hover:text-sky-350 transition-colors cursor-pointer"
                title="Restart Showcase"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restart
              </button>
            )}
          </div>
        </div>

        {/* Homepage CTA: Open Full Demo Album */}
        <div className="text-center mt-12">
          <Link
            to="/view/demo-album"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-sky-500/10 hover:shadow-sky-500/20 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" />
            Open Full Demo Album
          </Link>
        </div>
      </div>
    </section>
  );
}
