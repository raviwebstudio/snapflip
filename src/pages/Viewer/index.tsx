import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Lock,
  Music,
  ArrowLeft,
  ArrowRight,
  Download,
  Info,
  Camera,
  AlertTriangle
} from "lucide-react";
import { PageFlip } from "page-flip";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { useToastStore } from "../../store";

// Error Boundary for the premium viewer experience
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

// Memoized Page list component to completely prevent React re-renders from conflicting with page-flip library DOM modifications
const BookPagesList = React.memo(
  ({
    totalPhotos,
    hasFillerPage,
    totalPages,
    renderPage
  }: {
    totalPhotos: number;
    hasFillerPage: boolean;
    totalPages: number;
    renderPage: (idx: number) => React.ReactNode;
  }) => {
    return (
      <>
        {/* Page 0: Cover */}
        <div key="page-cover" className="book-page" data-density="hard">
          {renderPage(0)}
        </div>

        {/* Page 1 to N: Photos */}
        {Array.from({ length: totalPhotos }).map((_, idx) => (
          <div key={`photo-page-${idx}`} className="book-page" data-density="soft">
            {renderPage(idx + 1)}
          </div>
        ))}

        {/* Filler Page if needed */}
        {hasFillerPage && (
          <div key="page-filler" className="book-page" data-density="soft">
            {renderPage(totalPages - 2)}
          </div>
        )}

        {/* Last Page: Back Cover */}
        <div key="page-back-cover" className="book-page" data-density="hard">
          {renderPage(totalPages - 1)}
        </div>
      </>
    );
  },
  () => true // Never re-render the pages list after initial mount
);

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
  
  // Safe static viewer fallback state (VIEWER-007)
  const [useFallback, setUseFallback] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (slug) {
      const fetched = DbService.getAlbumById(slug);
      setAlbum(fetched);
      
      // If public or has no passcode, unlock by default
      if (fetched) {
        if (fetched.settings.visibility === "Public" || !fetched.settings.passcode) {
          setIsUnlocked(true);
        }
      }
    }
  }, [slug]);

  // Calculations for page index
  const totalPhotos = album ? album.photos.length : 0;
  const hasFillerPage = (totalPhotos + 2) % 2 !== 0;
  const totalPages = totalPhotos + 2 + (hasFillerPage ? 1 : 0);

  const handleNextPage = useCallback(() => {
    if (useFallback) {
      setCurrentPage((prev) => {
        if (prev === 0) return 1;
        const step = orientation === "landscape" ? 2 : 1;
        return Math.min(prev + step, totalPages - 1);
      });
      return;
    }
    if (isAnimating.current || !pageFlipRef.current) return;
    pageFlipRef.current.flipNext();
  }, [useFallback, orientation, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (useFallback) {
      setCurrentPage((prev) => {
        if (prev <= 1) return 0;
        const step = orientation === "landscape" ? 2 : 1;
        return Math.max(prev - step, 0);
      });
      return;
    }
    if (isAnimating.current || !pageFlipRef.current) return;
    pageFlipRef.current.flipPrev();
  }, [useFallback, orientation]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    if (passcodeInput === album.settings.passcode) {
      setIsUnlocked(true);
      addToast("Passcode verified. Collection unlocked!", "success");
    } else {
      addToast("Incorrect passcode. Please try again.", "error");
      setPasscodeInput("");
    }
  };

  // Initialize PageFlip library on container mount
  useEffect(() => {
    if (!containerRef.current || !templatesRef.current || !album || !isUnlocked || useFallback) return;

    try {
      console.log("[Diagnostics] Initializing PageFlip...");

      // 1. Clear container to guarantee a pristine state
      containerRef.current.innerHTML = "";

      // 2. Clone pristine templates from offscreen DOM to book wrapper
      const templates = templatesRef.current.querySelectorAll(".book-page");
      console.log("[Diagnostics] Total pages template elements count:", templates.length);

      if (templates.length === 0) {
        console.warn("[Diagnostics] No template pages found. Falling back to static viewer.");
        setUseFallback(true);
        return;
      }

      templates.forEach((t) => {
        const clone = t.cloneNode(true) as HTMLElement;
        containerRef.current?.appendChild(clone);
      });

      const pageElements = containerRef.current.querySelectorAll(".book-page");
      console.log("[Diagnostics] Total pages loaded into book DOM:", pageElements.length);

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Use "stretch" as any cast because SizeType compiles away at runtime (const enum)
      const pageFlip = new PageFlip(containerRef.current, {
        width: 550,
        height: 733,
        size: "stretch" as any,
        minWidth: 310,
        maxWidth: 1000,
        minHeight: 414,
        maxHeight: 1400,
        drawShadow: true,
        flippingTime: prefersReducedMotion ? 50 : 850,
        usePortrait: true,
        startPage: 0,
        autoSize: true,
        maxShadowOpacity: 0.35,
        showCover: true,
        disableFlipByClick: true,
        showPageCorners: true,
        clickEventForward: true
      });

      pageFlipRef.current = pageFlip;
      pageFlip.loadFromHTML(pageElements as any);

      // Set up event listeners
      pageFlip.on("flip", (e) => {
        const pageIdx = e.data as number;
        setCurrentPage(pageIdx);
        console.log("[Diagnostics] Current page index shifted to:", pageIdx);
      });

      pageFlip.on("updateOrientation", (e) => {
        setOrientation(e.data as "portrait" | "landscape");
      });

      pageFlip.on("changeState", (e) => {
        const state = e.data as string;
        isAnimating.current = (state === "flipping");
      });

      console.log("[Diagnostics] Flipbook initialized successfully.");
    } catch (err) {
      console.error("[Diagnostics] PageFlip failed to initialize, falling back to static viewer:", err);
      setUseFallback(true);
    }

    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy();
        pageFlipRef.current = null;
      }
    };
  }, [album, isUnlocked, useFallback]);

  // Keyboard navigation listener (← →)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Right") {
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        handlePrevPage();
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [handleNextPage, handlePrevPage]);

  const handleToggleMusic = () => {
    if (!album) return;
    setIsPlayingMusic(!isPlayingMusic);
    if (!isPlayingMusic) {
      addToast(`Playing background soundtrack: "${album.settings.music.replace("-", " ")}"`, "info");
    } else {
      addToast("Soundtrack muted", "info");
    }
  };

  const handleDownloadPhotos = () => {
    if (!album) return;
    if (!album.settings.allowDownload) {
      addToast("Downloads are disabled for this collection by the studio.", "warning");
      return;
    }
    addToast("Preparing high-resolution portfolio ZIP package...", "info");
    setTimeout(() => {
      addToast("Download started: " + album.name.replace(/\s+/g, "_") + "_highres.zip", "success");
    }, 2000);
  };

  // Reusable page rendering helper
  const renderPage = (idx: number) => {
    if (!album) return null;

    if (idx === 0) {
      // Cover page rendering
      return (
        <div className="relative w-full h-full bg-slate-900 flex flex-col justify-between p-8 text-center border-r border-slate-950/40">
          {album.coverImage && (
            <img src={album.coverImage} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 z-0" />
          <div className="relative z-10 space-y-2">
            <Camera className="h-8 w-8 mx-auto text-sky-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">Exclusive Showcase</span>
          </div>
          <div className="relative z-10 space-y-3">
            <h2 className="text-xl font-extrabold text-white leading-tight uppercase tracking-wider">{album.name}</h2>
            <div className="h-0.5 w-12 bg-sky-400 mx-auto" />
            <p className="text-xs text-slate-355 font-mono tracking-widest">{album.coupleName}</p>
          </div>
          <div className="relative z-10">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Staged on SnapFlip</span>
          </div>
        </div>
      );
    }

    if (idx === totalPages - 1) {
      // Back Cover page rendering
      return (
        <div className="relative w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 text-center border-l border-slate-900">
          <Camera className="h-8 w-8 text-sky-500 mb-2" />
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">The End</h4>
          <p className="text-[10px] text-slate-555 mt-1">SnapFlip Album Showcase</p>
        </div>
      );
    }

    if (hasFillerPage && idx === totalPages - 2) {
      // Filler blank page rendering
      return (
        <div className="relative w-full h-full bg-slate-900/60 flex flex-col items-center justify-center p-8 text-center border-r border-slate-950/20">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">End of Album</span>
        </div>
      );
    }

    // Inside photo pages
    const photoIdx = idx - 1;
    const photo = album.photos[photoIdx];
    if (!photo) return null;

    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-955 flex items-center justify-center border-x border-slate-950/20">
        <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
        {album.settings.watermark && (
          <div className="absolute inset-0 bg-slate-950/10 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/20 border border-white/15 px-2.5 py-1 rounded rotate-12">
              © {album.coupleName || "SnapFlip"}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Static Fallback layout if PageFlip fails
  const renderStaticFallback = () => {
    if (currentPage === 0) {
      return (
        <div className="w-full max-w-[420px] aspect-[0.75] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
          {renderPage(0)}
        </div>
      );
    }

    if (currentPage === totalPages - 1) {
      return (
        <div className="w-full max-w-[420px] aspect-[0.75] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
          {renderPage(totalPages - 1)}
        </div>
      );
    }

    if (orientation === "portrait") {
      return (
        <div className="w-full max-w-[420px] aspect-[0.75] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
          {renderPage(currentPage)}
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
        <div className="w-full aspect-[0.75] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800 bg-slate-900">
          {renderPage(currentPage)}
        </div>
        <div className="w-full aspect-[0.75] rounded-xl overflow-hidden shadow-2xl relative border border-slate-800 bg-slate-900">
          {currentPage + 1 < totalPages - 1 ? renderPage(currentPage + 1) : (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center border border-slate-900/60 rounded-2xl">
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">End of Album</span>
            </div>
          )}
        </div>
      </div>
    );
  };

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

  // If locked, render passcode prompt screen
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

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col justify-between bg-slate-950 text-slate-100">
      {/* CSS Styles for the PageFlip library integration */}
      <style dangerouslySetInnerHTML={{ __html: `
        .st-page-flip-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          position: relative;
        }
        .st-page-flip {
          position: relative;
          box-shadow: 0 30px 80px -15px rgba(0, 0, 0, 0.9);
          border-radius: 12px;
          overflow: hidden;
          background-color: #030712;
        }
        .book-page {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: #0b0f19;
          box-shadow: inset 0 0 45px rgba(0, 0, 0, 0.6);
        }
        .book-page[data-density="hard"] {
          background-color: #0f172a;
          box-shadow: inset 0 0 55px rgba(0, 0, 0, 0.8);
        }
      ` }} />

      {/* 1. Header controls */}
      <header className="h-16 px-4 sm:px-6 lg:px-8 border-b flex items-center justify-between z-10 border-slate-900 bg-slate-955/80 backdrop-blur-md">
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
            onClick={() => setShowInfo(!showInfo)}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer border-slate-800 text-slate-400 hover:text-white ${
              showInfo ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : ""
            }`}
            title="Collection details"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Background Music Toggle */}
          {album.settings.music && album.settings.music !== "none" && (
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
          {album.settings.allowDownload && (
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

      {/* 2. Spread Info Panel (Conditional overlay) */}
      {showInfo && (
        <div className="p-4 border-b text-xs leading-relaxed bg-slate-955/95 border-slate-900 text-slate-300">
          <div className="max-w-2xl mx-auto space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Description</h4>
            <p className="text-slate-450">{album.settings.description || "No description provided for this collection."}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900/60 mt-2">
              <span>Client: {album.coupleName}</span>
              <span>Event: {album.eventType} ({album.eventDate})</span>
              <span>Size Format: {album.settings.albumSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Flipbook spread display area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        {/* Animated equalizer bars for music */}
        {isPlayingMusic && (
          <div className="absolute top-4 left-4 flex gap-0.5 items-end h-4 shrink-0 opacity-60">
            <span className="w-0.5 h-3 bg-sky-400 animate-pulse" />
            <span className="w-0.5 h-4 bg-sky-400 animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-sky-400 animate-pulse delay-150" />
            <span className="w-0.5 h-3.5 bg-sky-400 animate-pulse delay-100" />
          </div>
        )}

        {/* Templates Hidden Node Container (Managed fully by React) */}
        <div style={{ display: "none" }} ref={templatesRef}>
          <BookPagesList
            totalPhotos={totalPhotos}
            hasFillerPage={hasFillerPage}
            totalPages={totalPages}
            renderPage={renderPage}
          />
        </div>

        {/* Spread Container */}
        <div className="max-w-5xl w-full flex flex-col items-center gap-6">
          {/* Flipbook Frame */}
          <div className="w-full flex justify-center items-center py-4 flex-1 min-h-[50vh] max-h-[70vh] relative">
            {useFallback ? (
              renderStaticFallback()
            ) : (
              <div className="st-page-flip-wrapper">
                <div ref={containerRef} className="st-page-flip select-none" />
              </div>
            )}
          </div>

          {/* Individual Page Numbers */}
          {currentPage > 0 && currentPage < totalPages - 1 && (
            <div className="text-[10px] font-mono text-slate-400 tracking-wider">
              {orientation === "landscape" && !useFallback ? (
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

          {/* Navigation Controls & Spread Indicator */}
          <div className="flex items-center gap-6 mt-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <span className="text-xs font-mono tracking-wider font-semibold text-slate-300 select-none">
              {currentPage === 0 ? (
                "Cover Page"
              ) : currentPage === totalPages - 1 ? (
                "Back Cover"
              ) : (orientation === "landscape" && !useFallback) ? (
                `Spread ${Math.floor((currentPage - 1) / 2) + 1} of ${Math.floor((totalPages - 2) / 2) + 1}`
              ) : (
                `Page ${currentPage} of ${totalPhotos}`
              )}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Footer credits */}
      <footer className="h-12 px-4 border-t flex items-center justify-center z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-slate-900 bg-slate-950/60">
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
