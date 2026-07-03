import { useState, useEffect } from "react";
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
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { useToastStore } from "../../store";

export default function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToastStore();
  
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 0 = Cover page, 1 = Page 1 & 2, etc.
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const isDarkMode = true;
  const [showInfo, setShowInfo] = useState(false);

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

  // Handle Passcode Unlock
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

  // Aspect ratio helper (P5-009)
  const getPageAspectRatioStyle = (): React.CSSProperties => {
    if (!album) return { aspectRatio: "4/3" };
    
    const size = album.settings.albumSize || "auto";
    const customWidth = Number(album.settings.customWidth);
    const customHeight = Number(album.settings.customHeight);

    let ratio = "4/3"; // default landscape

    if (size === "a5-portrait" || size === "a4-portrait") {
      ratio = "148/210"; // tall portrait
    } else if (size === "a5-landscape" || size === "a4-landscape") {
      ratio = "210/148"; // wide landscape
    } else if (size === "square-8" || size === "square-10") {
      ratio = "1/1"; // perfect square
    } else if (size === "12x18") {
      ratio = "18/12"; // wide 3/2
    } else if (size === "14x11") {
      ratio = "14/11"; // wide 14/11
    } else if (size === "16x24") {
      ratio = "24/16"; // wide 3/2
    } else if (size === "18x24") {
      ratio = "24/18"; // wide 4/3
    } else if (size === "custom" && customWidth && customHeight) {
      ratio = `${customWidth}/${customHeight}`;
    } else if (size === "auto") {
      // Determine dominant layout from files
      let portraitCount = 0;
      let landscapeCount = 0;
      let squareCount = 0;

      album.photos.forEach((file) => {
        const w = file.width || 800;
        const h = file.height || 600;
        const r = w / h;
        if (r > 1.2) {
          landscapeCount++;
        } else if (r < 0.8) {
          portraitCount++;
        } else {
          squareCount++;
        }
      });

      if (portraitCount > landscapeCount && portraitCount > squareCount) {
        ratio = "148/210";
      } else if (squareCount > landscapeCount && squareCount > portraitCount) {
        ratio = "1/1";
      } else {
        ratio = "210/148";
      }
    }

    return { aspectRatio: ratio };
  };

  // Helper for single cover page aspect ratio
  const getCoverAspectRatioStyle = (): React.CSSProperties => {
    return getPageAspectRatioStyle();
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

  // Calculations for page index
  // Cover is Page 0. Internal photos are 1 to length.
  const totalPhotos = album.photos.length;
  // If we show two-page spreads: spread 0 is Cover. Spread 1 is Photo 1 & 2. Spread N is Photo (2N-1) & 2N.
  const totalSpreads = Math.ceil(totalPhotos / 2) + 1;

  const handleNextPage = () => {
    if (currentPage < totalSpreads - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleToggleMusic = () => {
    setIsPlayingMusic(!isPlayingMusic);
    if (!isPlayingMusic) {
      addToast(`Playing background soundtrack: "${album.settings.music.replace("-", " ")}"`, "info");
    } else {
      addToast("Soundtrack muted", "info");
    }
  };

  const handleDownloadPhotos = () => {
    if (!album.settings.allowDownload) {
      addToast("Downloads are disabled for this collection by the studio.", "warning");
      return;
    }
    // Simulate bulk download zipper trigger
    addToast("Preparing high-resolution portfolio ZIP package...", "info");
    setTimeout(() => {
      addToast("Download started: " + album.name.replace(/\s+/g, "_") + "_highres.zip", "success");
    }, 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col justify-between ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* 1. Header controls */}
      <header className={`h-16 px-4 sm:px-6 lg:px-8 border-b flex items-center justify-between z-10 ${
        isDarkMode ? "border-slate-900 bg-slate-950/80" : "border-slate-200 bg-white/80"
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard?tab=albums"
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer ${
              isDarkMode
                ? "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            Dashboard
          </Link>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider">{album.name}</h1>
            <span className="text-[9px] text-slate-500 font-mono block">By {album.coupleName || "Studio"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isDarkMode
                ? "border-slate-800 text-slate-400 hover:text-white"
                : "border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title="Collection Info"
          >
            <Info className="h-4 w-4" />
          </button>

          {/* Music Toggle */}
          {album.settings.music !== "none" && (
            <button
              onClick={handleToggleMusic}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer relative ${
                isDarkMode
                  ? "border-slate-800 text-slate-400 hover:text-white"
                  : "border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              title="Toggle Background Music"
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
        <div className={`p-4 border-b text-xs leading-relaxed ${
          isDarkMode ? "bg-slate-950/95 border-slate-900 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="max-w-2xl mx-auto space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Description</h4>
            <p>{album.settings.description || "No description provided for this collection."}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 font-mono text-[9px] text-slate-500">
              <div>
                <span className="block text-[8px] uppercase tracking-wider">Date Captured</span>
                <span className="text-slate-300 font-semibold">{album.eventDate}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider">Passcode Locked</span>
                <span className="text-slate-300 font-semibold">{album.settings.passcode ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider">Watermark Overlay</span>
                <span className="text-slate-300 font-semibold">{album.settings.watermark ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider">Photos Staged</span>
                <span className="text-slate-300 font-semibold">{totalPhotos}</span>
              </div>
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

        {/* Spread Container */}
        <div className="max-w-5xl w-full flex flex-col items-center gap-6">
          {/* Flipbook Frame with simulated shadow spreads */}
          <div className="w-full flex justify-center items-center">
            {currentPage === 0 ? (
              /* COVER PAGE */
              <div
                style={getCoverAspectRatioStyle()}
                className={`relative w-full max-w-[340px] rounded-r-2xl shadow-2xl border-l-[6px] border-slate-900 overflow-hidden flex flex-col justify-between p-8 text-center transition-all ${
                  isDarkMode
                    ? "bg-slate-900 shadow-slate-950/65"
                    : "bg-slate-100 shadow-slate-300/40"
                }`}
              >
                {album.coverImage && (
                  <img src={album.coverImage} alt="Cover" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 z-0" />

                <div className="relative z-10 space-y-2">
                  <Camera className="h-8 w-8 mx-auto text-sky-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">Exclusive Showcase</span>
                </div>

                <div className="relative z-10 space-y-3">
                  <h2 className="text-2xl font-extrabold text-white leading-tight uppercase tracking-wider">{album.name}</h2>
                  <div className="h-0.5 w-12 bg-sky-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-mono tracking-widest">{album.coupleName}</p>
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Staged on SnapFlip</span>
                </div>
              </div>
            ) : (
              /* DOUBLE PAGE SPREAD */
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 relative bg-slate-950/15 p-2 rounded-3xl border border-slate-900/10">
                {/* Left Page (Photo index: (currentPage-1)*2 ) */}
                {(() => {
                  const leftIdx = (currentPage - 1) * 2;
                  const leftPhoto = leftIdx < totalPhotos ? album.photos[leftIdx] : null;

                  return (
                    <div
                      style={getPageAspectRatioStyle()}
                      className={`rounded-2xl overflow-hidden relative flex items-center justify-center shadow-lg transition-all ${
                        isDarkMode ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    >
                      {leftPhoto ? (
                        <>
                          <img src={leftPhoto.url} alt={leftPhoto.name} className="h-full w-full object-cover" />
                          {album.settings.watermark && (
                            <div className="absolute inset-0 bg-slate-950/10 flex items-center justify-center pointer-events-none select-none">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 border border-white/10 px-3 py-1.5 rounded rotate-12">
                                © {album.coupleName || "SnapFlip"}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">End of Album</span>
                      )}
                      <span className="absolute bottom-3 left-4 text-[9px] font-mono text-slate-400/80 bg-slate-950/60 px-2 py-0.5 rounded">
                        Page {leftIdx + 1}
                      </span>
                    </div>
                  );
                })()}

                {/* Right Page (Photo index: (currentPage-1)*2 + 1 ) */}
                {(() => {
                  const rightIdx = (currentPage - 1) * 2 + 1;
                  const rightPhoto = rightIdx < totalPhotos ? album.photos[rightIdx] : null;

                  return (
                    <div
                      style={getPageAspectRatioStyle()}
                      className={`rounded-2xl overflow-hidden relative flex items-center justify-center shadow-lg transition-all ${
                        isDarkMode ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    >
                      {rightPhoto ? (
                        <>
                          <img src={rightPhoto.url} alt={rightPhoto.name} className="h-full w-full object-cover" />
                          {album.settings.watermark && (
                            <div className="absolute inset-0 bg-slate-950/10 flex items-center justify-center pointer-events-none select-none">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-white/20 border border-white/10 px-3 py-1.5 rounded rotate-12">
                                © {album.coupleName || "SnapFlip"}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">End of Album</span>
                      )}
                      <span className="absolute bottom-3 right-4 text-[9px] font-mono text-slate-400/80 bg-slate-950/60 px-2 py-0.5 rounded">
                        Page {rightIdx + 1}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Navigation Spread Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDarkMode ? "border-slate-800 hover:text-white" : "border-slate-200 hover:text-slate-950"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            <span className="text-xs font-mono tracking-wider font-semibold">
              {currentPage === 0 ? "Cover Page" : `Spread ${currentPage} of ${totalSpreads - 1}`}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalSpreads - 1}
              className={`h-10 w-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDarkMode ? "border-slate-800 hover:text-white" : "border-slate-200 hover:text-slate-950"
              }`}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Footer credits */}
      <footer className={`h-12 px-4 border-t flex items-center justify-center z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest ${
        isDarkMode ? "border-slate-900 bg-slate-950/60" : "border-slate-200 bg-slate-100"
      }`}>
        Powered by SnapFlip
      </footer>
    </div>
  );
}
