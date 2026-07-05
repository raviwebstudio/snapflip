import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Lock,
  Music,
  ArrowLeft,
  ArrowRight,
  Download,
  Info,
  AlertTriangle,
  Play,
  Pause
} from "lucide-react";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { useToastStore } from "../../store";
import { detectRecommendedSize } from "../../utils/albumUtils";
import BookEngine, { type BookEngineRef } from "../../components/viewer/BookEngine";

// ─── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ViewerErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Viewer error boundary caught a runtime exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-450 flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Showcase Experience Error</h2>
            <p className="text-xs text-slate-450 max-w-sm">
              We encountered an issue preparing this premium presentation. You can try refreshing the page or contact the studio support.
            </p>
            {this.state.error && (
              <pre className="text-[9px] font-mono bg-slate-900 border border-slate-850 p-3 rounded text-rose-400 max-w-md mx-auto overflow-auto text-left leading-normal">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:text-white text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Refresh Presentation
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ─── Main Viewer ────────────────────────────────────────────────────────────

function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToastStore();
  
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  const handleManualInteraction = useCallback(() => {
    setIsAutoplayActive(false);
  }, []);

  const bookEngineRef = useRef<BookEngineRef>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  // Click outside listener to dismiss info popover panel (Dismiss on click outside)
  useEffect(() => {
    if (!showInfo) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (infoPanelRef.current && !infoPanelRef.current.contains(event.target as Node)) {
        const toggleBtn = document.getElementById("info-toggle-btn");
        if (toggleBtn && !toggleBtn.contains(event.target as Node)) {
          setShowInfo(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);

  useEffect(() => {
    if (slug) {
      const refresh = () => {
        const fetched = DbService.getAlbumById(slug);
        setAlbum(fetched);
        
        // If public or has no passcode, unlock by default
        if (fetched) {
          if (fetched.settings?.visibility === "Public" || !fetched.settings?.passcode) {
            setIsUnlocked(true);
          }
        }
      };

      refresh();
      return DbService.onBinariesLoaded(refresh);
    }
  }, [slug]);

  // Calculations for page display info
  const totalPhotos = album ? album.photos.length : 0;
  const hasFillerPage = (totalPhotos + 2) % 2 !== 0;
  const totalPages = totalPhotos + 2 + (hasFillerPage ? 1 : 0);

  // Resolve effective album size for auto-detect
  let resolvedDetectedSize: "Portrait" | "Square" | "Landscape" | undefined = undefined;
  if (album && album.settings?.albumSize === "auto") {
    const result = detectRecommendedSize(album.photos);
    // Extract orientation from recommendation
    if (result.recommended.includes("portrait")) {
      resolvedDetectedSize = "Portrait";
    } else if (result.recommended.includes("10x10") || result.recommended.includes("square")) {
      resolvedDetectedSize = "Square";
    } else {
      resolvedDetectedSize = "Landscape";
    }
  }

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, []);

  const handleOrientationChange = useCallback((newOrientation: "portrait" | "landscape") => {
    setOrientation(newOrientation);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    if (passcodeInput === album.settings?.passcode) {
      setIsUnlocked(true);
      addToast("Passcode verified. Collection unlocked!", "success");
    } else {
      addToast("Incorrect passcode. Please try again.", "error");
      setPasscodeInput("");
    }
  };

  const handleToggleMusic = () => {
    if (!album) return;
    setIsPlayingMusic(!isPlayingMusic);
    if (!isPlayingMusic) {
      addToast(`Playing background soundtrack: "${album.settings?.music?.replace("-", " ") ?? "unknown"}"`, "info");
    } else {
      addToast("Soundtrack muted", "info");
    }
  };

  const handleDownloadPhotos = () => {
    if (!album) return;
    if (!album.settings?.allowDownload) {
      addToast("Downloads are disabled for this collection by the studio.", "warning");
      return;
    }
    addToast("Preparing high-resolution portfolio ZIP package...", "info");
    setTimeout(() => {
      addToast("Download started: " + album.name.replace(/\s+/g, "_") + "_highres.zip", "success");
    }, 2000);
  };

  // ─── Not Found ──────────────────────────────────────────────────────────

  if (!album) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 animate-bounce" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Album Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            The collection link you followed may have been deleted, renamed, or is currently undergoing maintenance.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  // ─── Passcode Lock ──────────────────────────────────────────────────────

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-[20%] h-[300px] w-[300px] rounded-full bg-[#0b3037]/15 blur-[120px] pointer-events-none" />
        
        <form
          onSubmit={handleUnlock}
          className="max-w-sm w-full rounded-3xl border border-slate-900 bg-slate-950/80 p-8 space-y-6 shadow-2xl relative z-10"
        >
          <div className="h-12 w-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
            <Lock className="h-5 w-5" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">{album.name}</h2>
            <p className="text-xs text-slate-500">This photography collection is passcode protected.</p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              required
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 text-center font-mono tracking-widest text-sm"
            />
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-sky-500/5"
            >
              Verify Passcode
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Main Viewer Layout ─────────────────────────────────────────────────

  return (
    <div className="h-screen overflow-hidden transition-colors duration-300 flex flex-col justify-between bg-slate-950 text-slate-100 relative">
      {/* 1. Header controls */}
      <header className="h-16 px-4 sm:px-6 lg:px-8 border-b flex items-center justify-between z-10 border-slate-900 bg-slate-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard?tab=albums"
            className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
          >
            Dashboard
          </Link>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider">{album.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Info Toggle */}
          <button
            id="info-toggle-btn"
            onClick={() => setShowInfo(!showInfo)}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer border-slate-800 text-slate-400 hover:text-white ${
              showInfo ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : ""
            }`}
            title="Collection details"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Autoplay / Slideshow Toggle */}
          <button
            onClick={() => setIsAutoplayActive(!isAutoplayActive)}
            className={`h-9 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-slate-800 text-slate-400 hover:text-white ${
              isAutoplayActive ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : ""
            }`}
            title="Toggle Slideshow Autoplay"
          >
            {isAutoplayActive ? (
              <>
                <Pause className="h-4 w-4 text-sky-450 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">Playing</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">Slideshow</span>
              </>
            )}
          </button>

          {/* Background Music Toggle */}
          {album.settings?.music && album.settings?.music !== "none" && (
            <button
              onClick={handleToggleMusic}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer border-slate-800 text-slate-400 hover:text-white relative ${
                isPlayingMusic ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : ""
              }`}
              title="Toggle soundtrack"
            >
              <Music className={`h-4 w-4 ${isPlayingMusic ? "text-sky-400 animate-pulse" : ""}`} />
              {isPlayingMusic && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-400" />
              )}
            </button>
          )}

          {/* Download Button */}
          {album.settings?.allowDownload && (
            <button
              onClick={handleDownloadPhotos}
              className="h-9 items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-3 text-xs uppercase tracking-wider flex gap-1.5 cursor-pointer shadow-md shadow-sky-500/10"
              title="Download full collection"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Info Panel (Absolute Popover Overlay to avoid layout shifts) */}
      {showInfo && (
        <div
          ref={infoPanelRef}
          className="absolute right-4 top-18 md:right-8 w-[calc(100vw-32px)] md:w-96 rounded-2xl border border-slate-900 bg-slate-950/95 backdrop-blur-md p-5 text-xs leading-relaxed text-slate-350 z-30 shadow-2xl space-y-3"
        >
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] border-b border-slate-900 pb-2">
            Collection Details
          </h4>
          <p className="text-slate-400">
            {album.settings?.description || "No description provided for this collection."}
          </p>
          <div className="flex flex-col gap-2 text-[10px] font-mono text-slate-500 pt-1">
            <div>Client: <span className="text-slate-305">{album.coupleName || "Unspecified"}</span></div>
            <div>Event Type: <span className="text-slate-305 capitalize">{album.eventType || "None"}</span></div>
            <div>Event Date: <span className="text-slate-305">{album.eventDate || "None"}</span></div>
            <div>Layout Size: <span className="text-slate-305 uppercase">{album.settings?.albumSize ?? "Auto"}</span></div>
          </div>
        </div>
      )}

      {/* 3. Main Book Display Area */}
      <main className="flex-1 flex flex-col justify-between p-4 md:p-6 relative overflow-hidden">
        {/* Animated equalizer bars for music */}
        {isPlayingMusic && (
          <div className="absolute top-4 left-4 flex gap-0.5 items-end h-4 shrink-0 opacity-60">
            <span className="w-0.5 h-3 bg-sky-400 animate-pulse" />
            <span className="w-0.5 h-4 bg-sky-400 animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-sky-400 animate-pulse delay-150" />
            <span className="w-0.5 h-3.5 bg-sky-400 animate-pulse delay-100" />
          </div>
        )}

        {/* Book Container - Flex layout with centered content */}
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden">
          {/* BookEngine Wrapper */}
          <div className="w-full flex justify-center items-center flex-1 max-h-[calc(100vh-220px)] relative">
            <BookEngine
              ref={bookEngineRef}
              photos={album.photos}
              albumSize={album.settings?.albumSize ?? "auto"}
              customWidth={album.settings?.customWidth}
              customHeight={album.settings?.customHeight}
              detectedSize={album.settings?.detectedSize ?? resolvedDetectedSize}
              albumTitle={album.name}
              coupleName={album.coupleName}
              watermark={album.settings?.watermark ?? false}
              watermarkText={album.coupleName || "SnapFlip"}
              coverImage={album.coverImage}
              onPageChange={handlePageChange}
              onOrientationChange={handleOrientationChange}
              autoPlay={isAutoplayActive}
              onInteraction={handleManualInteraction}
            />
          </div>

          {/* Bottom Controls Area (Pagination and Next/Prev buttons) */}
          <div className="flex flex-col items-center gap-3 shrink-0 pb-2">
            {/* Page Numbers */}
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                {orientation === "landscape" ? (
                  (() => {
                    const leftIdx = currentPage;
                    const rightIdx = currentPage + 1;
                    const leftLabel = leftIdx <= totalPhotos ? `Page ${leftIdx}` : "";
                    const rightLabel = rightIdx <= totalPhotos ? `Page ${rightIdx}` : "";
                    if (leftLabel && rightLabel) {
                      return `${leftLabel} | ${rightLabel}`;
                    }
                    return leftLabel || rightLabel || "";
                  })()
                ) : (
                  `Page ${currentPage}`
                )}
              </div>
            )}

            {/* Navigation Buttons and Spread Indicator */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  bookEngineRef.current?.flipPrev();
                }}
                disabled={currentPage === 0}
                className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-300 select-none">
                {currentPage === 0 ? (
                  "Cover Page"
                ) : currentPage >= totalPages - 1 ? (
                  "Back Cover"
                ) : orientation === "landscape" ? (
                  `Spread ${Math.floor((currentPage - 1) / 2) + 1} of ${Math.floor((totalPages - 2) / 2) + 1}`
                ) : (
                  `Page ${currentPage} of ${totalPhotos}`
                )}
              </span>

              <button
                onClick={() => {
                  bookEngineRef.current?.flipNext();
                }}
                disabled={currentPage >= totalPages - 1}
                className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer credits */}
      <footer className="h-12 px-4 border-t flex items-center justify-center z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-slate-900 bg-slate-950/60 shrink-0">
        Powered by SnapFlip
      </footer>
    </div>
  );
}

// Default export wrapped with ErrorBoundary to prevent React runtime dev screen crashes
export default function ViewerWithErrorBoundary() {
  return (
    <ViewerErrorBoundary>
      <Viewer />
    </ViewerErrorBoundary>
  );
}
