import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Music,
  ArrowLeft,
  ArrowRight,
  Download,
  Info,
  AlertTriangle,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Share2,
  Copy,
  Check,
  QrCode,
  ExternalLink
} from "lucide-react";
import QRCode from "qrcode";
import { DbService } from "../../services/dbService";
import type { Album } from "../../services/dbService";
import { AnalyticsService } from "../../services/AnalyticsService";
import { useToastStore } from "../../store";
import { detectRecommendedSize } from "../../utils/albumUtils";
import BookEngine, { type BookEngineRef } from "../../components/viewer/BookEngine";
import ToastContainer from "../../components/dashboard/ToastContainer";

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

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string
) {
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  const visibleLines = lines.slice(0, 2);
  const startY = y - ((visibleLines.length - 1) * lineHeight) / 2;
  visibleLines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [album, setAlbum] = useState<Album | null | undefined>(undefined);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (!slug) return false;
    return localStorage.getItem(`snapflip_unlocked_${slug}`) === "true";
  });
  const [isUnpublished, setIsUnpublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [viewerQrCode, setViewerQrCode] = useState("");
  const [showShare, setShowShare] = useState(false);

  const sharePanelRef = useRef<HTMLDivElement | null>(null);
  const hasLoggedViewRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());
  const pageLogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (!slug) return 0;
    const saved = localStorage.getItem(`snapflip_page_${slug}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookSize, setBookSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  const bookEngineRef = useRef<BookEngineRef>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPublicAlbumUrl = useCallback((targetAlbum: Album) => {
    const albumPath = `/album/${targetAlbum.slug || targetAlbum.id}`;
    const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL || import.meta.env.VITE_APP_URL || "";
    const configuredOrigin = configuredUrl.replace(/\/$/, "");
    const isLocalOrigin = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(window.location.origin);
    const origin = configuredOrigin || (isLocalOrigin ? "https://snapflip-ruddy.vercel.app" : window.location.origin);
    return `${origin}${albumPath}`;
  }, []);

  const getStudioName = useCallback(() => {
    try {
      const savedBrand = localStorage.getItem("snapflip_settings_brand");
      if (savedBrand) {
        const parsed = JSON.parse(savedBrand);
        if (typeof parsed?.studioName === "string" && parsed.studioName.trim()) {
          return parsed.studioName.trim();
        }
      }
    } catch {
      // Public visitors may not have local studio settings.
    }
    return "Aura Studios";
  }, []);

  // Sync currentPage to localStorage
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`snapflip_page_${slug}`, currentPage.toString());
    }
  }, [slug, currentPage]);

  const handleManualInteraction = useCallback(() => {
    setIsAutoplayActive(false);
  }, []);

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "ArrowRight") {
        bookEngineRef.current?.flipNext();
      } else if (e.key === "ArrowLeft") {
        bookEngineRef.current?.flipPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const docEl = document.documentElement as any;
    const doc = document as any;
    
    const isFs = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFs) {
      const requestFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (requestFS) {
        const promise = requestFS.call(docEl);
        if (promise && typeof promise.then === "function") {
          promise.then(() => {
            setIsFullscreen(true);
          }).catch((err: any) => {
            console.error("Error attempting to enable fullscreen mode:", err);
          });
        } else {
          // Fallback if requestFullscreen returns void (older Safari/WebKit versions)
          setIsFullscreen(true);
        }
      }
    } else {
      const exitFS =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;
      if (exitFS) {
        const promise = exitFS.call(doc);
        if (promise && typeof promise.then === "function") {
          promise.then(() => {
            setIsFullscreen(false);
          });
        } else {
          // Fallback if exitFullscreen returns void
          setIsFullscreen(false);
        }
      }
    }
  };

  useEffect(() => {
    setZoomScale(1);
    const timers = [80, 180, 360].map((delay) =>
      window.setTimeout(() => {
        bookEngineRef.current?.resize();
      }, delay)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isFullscreen]);

  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    if (containerRef.current) {
      setScrollStart({
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop
      });
    }
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomScale <= 1 || !containerRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    containerRef.current.scrollLeft = scrollStart.left - dx;
    containerRef.current.scrollTop = scrollStart.top - dy;
  };

  const handlePanMouseUp = () => {
    setIsPanning(false);
  };

  // Click outside listener to dismiss info and share popover panels (Dismiss on click outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Info Panel
      if (showInfo && infoPanelRef.current) {
        const toggleBtn = document.getElementById("info-toggle-btn");
        if (toggleBtn && !toggleBtn.contains(event.target as Node) && !infoPanelRef.current.contains(event.target as Node)) {
          setShowInfo(false);
        }
      }
      // Share Panel
      if (showShare && sharePanelRef.current) {
        const toggleBtn = document.getElementById("share-toggle-btn");
        if (toggleBtn && !toggleBtn.contains(event.target as Node) && !sharePanelRef.current.contains(event.target as Node)) {
          setShowShare(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo, showShare]);

  useEffect(() => {
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (slug) {
      const refresh = async () => {
        setIsLoading(true);
        try {
          const isViewRoute = location.pathname.startsWith("/view/");
          const isUuidSlug = isUuid(slug);

          let fetched: Album | undefined = undefined;
          fetched = await DbService.getAlbumById(slug);

          if (!fetched) {
            setAlbum(null); // Null means explicitly not found (404)
            setIsLoading(false);
            return;
          }

          // Security: Prevent direct access to unpublished/draft albums
          if (fetched.id !== "demo-album" && fetched.status !== "Published") {
            setIsUnpublished(true);
            setAlbum(fetched);
            setIsLoading(false);
            return;
          }

          // Redirect to /album/:slug if legacy view route or UUID slug
          if (isViewRoute || isUuidSlug) {
            navigate(`/album/${fetched.slug || fetched.id}`, { replace: true });
            return;
          }

          if (fetched && fetched.settings?.albumSize === "auto" && !fetched.settings?.detectedSize) {
            const detected = detectRecommendedSize(fetched.photos, fetched.coverImage).recommended;
            fetched.settings = {
              ...fetched.settings,
              detectedSize: detected,
            };
            DbService.updateAlbum(fetched.id, {
              settings: fetched.settings,
            }).catch((err) => console.error("Failed to save auto detected size for existing album:", err));
          }

          setAlbum(fetched);
          
          // If public or has no passcode, unlock by default
          if (fetched.settings?.visibility === "Public" || !fetched.settings?.passcode) {
            setIsUnlocked(true);
            localStorage.setItem(`snapflip_unlocked_${slug}`, "true");
          } else {
            // Check if already unlocked in this browser session
            const previouslyUnlocked = localStorage.getItem(`snapflip_unlocked_${slug}`) === "true";
            setIsUnlocked(previouslyUnlocked);
          }
        } catch (err) {
          console.error("Failed to load album in Viewer:", err);
          setAlbum(null);
        } finally {
          setIsLoading(false);
        }
      };

      refresh();
      return DbService.onBinariesLoaded(refresh);
    } else {
      setIsLoading(false);
    }
  }, [slug, location.pathname, navigate]);

  // Dynamically update SEO and Open Graph metadata on album load
  useEffect(() => {
    if (album) {
      document.title = `${album.name} | SnapFlip Showcase`;
      
      const updateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          if (property.startsWith("og:")) {
            meta.setAttribute("property", property);
          } else {
            meta.setAttribute("name", property);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
      };

      updateMeta("og:title", album.name);
      updateMeta("og:description", album.settings?.description || "Interactive professional photography book presentation.");
      updateMeta("og:image", album.coverImage || "");
      updateMeta("og:url", window.location.href);
      updateMeta("og:type", "website");
      updateMeta("twitter:card", "summary_large_image");
      updateMeta("twitter:title", album.name);
      updateMeta("twitter:description", album.settings?.description || "Interactive professional photography book presentation.");
      updateMeta("twitter:image", album.coverImage || "");

      // 1. Canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", window.location.href.split("?")[0]);

      // 2. Robots configuration (noindex for private/passcode albums)
      const isPublic = album.settings?.visibility === "Public";
      const robotsContent = isPublic ? "index, follow" : "noindex, nofollow";
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", robotsContent);
    }
  }, [album]);

  // Generate QR Code dynamically targeting /album/:slug
  useEffect(() => {
    if (album) {
      const shareUrl = getPublicAlbumUrl(album);
      QRCode.toDataURL(shareUrl, {
        margin: 1,
        width: 250,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      })
      .then(url => setViewerQrCode(url))
      .catch(err => console.error("Failed to generate viewer QR:", err));
    }
  }, [album, getPublicAlbumUrl]);

  // Log album views and QR opens
  useEffect(() => {
    if (album && isUnlocked && !hasLoggedViewRef.current) {
      hasLoggedViewRef.current = true;
      
      const logAnalytics = async () => {
        if (album.id === "demo-album") return;
        
        try {
          const service = new AnalyticsService();
          let visitorHash = localStorage.getItem("snapflip_visitor_hash");
          if (!visitorHash) {
            visitorHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("snapflip_visitor_hash", visitorHash);
          }

          const ua = navigator.userAgent;
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth < 768;
          const isTablet = /Tablet|iPad/i.test(ua) || (window.innerWidth >= 768 && window.innerWidth < 1024);
          const device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

          let browser = "other";
          if (ua.includes("Firefox")) browser = "firefox";
          else if (ua.includes("Edg")) browser = "edge";
          else if (ua.includes("Chrome")) browser = "chrome";
          else if (ua.includes("Safari")) browser = "safari";

          const searchParams = new URLSearchParams(window.location.search);
          const ref = searchParams.get("ref") || searchParams.get("src") || "";
          
          const meta = {
            device,
            browser,
            country: "Unknown",
            referrer: document.referrer || (ref ? `param_${ref}` : "direct")
          };

          // Log main view and album_open
          await service.logEvent(album.id, "view", visitorHash, meta);
          await service.logEvent(album.id, "album_open", visitorHash, meta);

          // Log unique_view if not already logged in this browser tab session
          if (!sessionStorage.getItem(`snapflip_viewed_${album.id}`)) {
            sessionStorage.setItem(`snapflip_viewed_${album.id}`, "true");
            await service.logEvent(album.id, "unique_view", visitorHash, meta);
          }

          // Log qr_open if ref=qr or src=qr
          if (ref === "qr") {
            await service.logEvent(album.id, "qr_open", visitorHash, meta);
          }
        } catch (err) {
          console.warn("Failed to log view analytics:", err);
        }
      };

      logAnalytics();
    }
  }, [album, isUnlocked]);

  // Log page turns (debounced to avoid spamming database)
  useEffect(() => {
    if (album && isUnlocked && currentPage > 0 && album.id !== "demo-album") {
      if (pageLogTimerRef.current) clearTimeout(pageLogTimerRef.current);
      
      pageLogTimerRef.current = setTimeout(() => {
        const service = new AnalyticsService();
        const visitorHash = localStorage.getItem("snapflip_visitor_hash") || "unknown";
        service.logEvent(album.id, "page_view" as any, visitorHash, {
          referrer: `page_${currentPage}`
        }).catch(console.error);
      }, 2000);
    }
    
    return () => {
      if (pageLogTimerRef.current) clearTimeout(pageLogTimerRef.current);
    };
  }, [album, isUnlocked, currentPage]);

  // Log duration of time spent on the album page
  useEffect(() => {
    if (!album || !isUnlocked || album.id === "demo-album") return;

    startTimeRef.current = Date.now();

    const logTimeSpent = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 2) {
        const service = new AnalyticsService();
        const visitorHash = localStorage.getItem("snapflip_visitor_hash") || "unknown";
        service.logEvent(album.id, "time_spent" as any, visitorHash, {
          referrer: `duration_${timeSpent}`
        }).catch(console.error);
        startTimeRef.current = Date.now();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logTimeSpent();
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      logTimeSpent();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [album, isUnlocked]);

  const logShareClick = () => {
    if (album && album.id !== "demo-album") {
      const service = new AnalyticsService();
      const visitorHash = localStorage.getItem("snapflip_visitor_hash") || "unknown";
      service.logEvent(album.id, "share", visitorHash).catch(console.error);
      service.logEvent(album.id, "share_click", visitorHash).catch(console.error);
    }
  };

  const handleCopyShareLink = () => {
    if (!album) return;
    const shareUrl = getPublicAlbumUrl(album);
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedShare(true);
        addToast("Share link copied to clipboard!", "success");
        logShareClick();
        setTimeout(() => setCopiedShare(false), 2000);
      })
      .catch(() => addToast("Failed to copy link.", "error"));
  };

  const handleNativeShare = () => {
    if (!album) return;
    const shareUrl = getPublicAlbumUrl(album);
    if (typeof navigator.share === "function") {
      navigator.share({
        title: album.name,
        text: album.settings?.description || `Check out ${album.name} collection!`,
        url: shareUrl
      })
      .then(() => {
        addToast("Shared successfully!", "success");
        logShareClick();
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          addToast("Failed to share link.", "error");
        }
      });
    }
  };

  const handleDownloadQR = async () => {
    if (!viewerQrCode || !album) return;

    try {
      const canvas = document.createElement("canvas");
      const scale = 3;
      const width = 1080;
      const height = 1440;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        addToast("Could not prepare QR card.", "error");
        return;
      }

      ctx.scale(scale, scale);
      const qrImage = await loadCanvasImage(viewerQrCode);
      const studioName = getStudioName();

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#020617");
      gradient.addColorStop(0.58, "#0f172a");
      gradient.addColorStop(1, "#082f49");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(14, 165, 233, 0.16)";
      ctx.beginPath();
      ctx.arc(910, 118, 255, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.055)";
      drawRoundedRect(ctx, 70, 70, 940, 1300, 42);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#0ea5e9";
      drawRoundedRect(ctx, 120, 120, 84, 84, 24);
      ctx.fill();
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 8;
      ctx.strokeRect(142, 151, 40, 30);
      ctx.beginPath();
      ctx.arc(162, 166, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.font = "800 42px Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SnapFlip", 226, 174);
      ctx.fillStyle = "#7dd3fc";
      ctx.font = "700 19px Arial, sans-serif";
      ctx.fillText("PREMIUM ALBUM SHOWCASE", 226, 204);

      ctx.textAlign = "center";
      ctx.fillStyle = "#f8fafc";
      wrapCanvasText(ctx, album.name, width / 2, 345, 760, 58, "800 56px Arial, sans-serif");
      ctx.fillStyle = "#bae6fd";
      ctx.font = "700 28px Arial, sans-serif";
      ctx.fillText(studioName, width / 2, 445);

      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, 235, 520, 610, 610, 36);
      ctx.fill();
      ctx.drawImage(qrImage, 275, 560, 530, 530);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "800 44px Arial, sans-serif";
      ctx.fillText("Scan to View Album", width / 2, 1230);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 24px Arial, sans-serif";
      ctx.fillText("Powered by SnapFlip", width / 2, 1290);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `snapflip-qr-card-${album.slug || album.id}.png`;
      link.click();
      addToast("QR Card download started!", "success");
    } catch (err) {
      console.error("Failed to generate QR card:", err);
      addToast("Failed to generate QR card.", "error");
    }
  };

  const handleLockAlbum = () => {
    if (!album) return;
    localStorage.removeItem(`snapflip_unlocked_${slug}`);
    setIsUnlocked(false);
    addToast("Collection locked successfully.", "info");
    setShowShare(false);
    setShowInfo(false);
  };

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
      localStorage.setItem(`snapflip_unlocked_${slug}`, "true");
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

    // Log download event to analytics
    if (album.id !== "demo-album") {
      const service = new AnalyticsService();
      const visitorHash = localStorage.getItem("snapflip_visitor_hash") || "unknown";
      service.logEvent(album.id, "download", visitorHash).catch(console.error);
      service.logEvent(album.id, "download_click", visitorHash).catch(console.error);
    }

    addToast("Preparing high-resolution portfolio ZIP package...", "info");
    setTimeout(() => {
      addToast("Download started: " + album.name.replace(/\s+/g, "_") + "_highres.zip", "success");
    }, 2000);
  };

  const handleSizeChange = useCallback((width: number, height: number) => {
    setBookSize({ width, height });
  }, []);

  // ─── Loading Screen ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center animate-spin duration-3000">
            <Lock className="h-6 w-6 text-sky-400 animate-pulse" />
          </div>
          <div className="absolute inset-0 h-16 w-16 rounded-2xl bg-sky-500/5 blur-[20px] animate-pulse" />
        </div>
        <div className="space-y-3 w-full max-w-sm text-center">
          <div className="h-4 bg-slate-900 rounded-full w-2/3 mx-auto animate-pulse" />
          <div className="h-3 bg-slate-900/60 rounded-full w-1/2 mx-auto animate-pulse" />
        </div>
        <div className="w-full max-w-4xl h-[400px] border border-slate-900 bg-slate-950/40 rounded-3xl p-6 flex gap-4 animate-pulse">
          <div className="flex-1 bg-slate-900/50 rounded-2xl h-full" />
          <div className="flex-1 bg-slate-900/50 rounded-2xl h-full hidden md:block" />
        </div>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────────────
  if (album === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-[20%] h-[300px] w-[300px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
        <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-450 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/5">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Album Not Found</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            The collection link you followed may have been deleted, renamed, or is currently private. If you believe this is an error, please contact the photographer.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/10"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  // ─── Unpublished Draft ──────────────────────────────────────────────────
  if (isUnpublished) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-[20%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg shadow-amber-500/5">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Album Unpublished</h2>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            This showcase portfolio is currently in draft mode. The photographer has not published this collection yet.
          </p>
        </div>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/10"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  if (!album) {
    return null;
  }

  // ─── Passcode Lock ──────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-[20%] h-[300px] w-[300px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />
        
        <form
          onSubmit={handleUnlock}
          className="max-w-sm w-full rounded-3xl border border-slate-900/60 bg-slate-950/80 p-8 space-y-6 shadow-2xl relative z-10 backdrop-blur-md"
        >
          <div className="h-12 w-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20 shadow-inner">
            <Lock className="h-5 w-5 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-widest leading-tight">{album.name}</h2>
            <p className="text-[11px] text-slate-400">This photography collection is passcode protected by the studio.</p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              required
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Enter Passcode"
              className="w-full h-11 px-4 rounded-xl border border-slate-900 bg-slate-950/60 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500/50 text-center font-mono tracking-widest text-sm transition-all focus:ring-1 focus:ring-sky-500/20"
            />
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-sky-500/10 transition-colors"
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        gridTemplateRows: isFullscreen ? "1fr" : "64px 1fr 48px",
        gridTemplateColumns: "1fr",
        background: "#020617",
        color: "#f1f5f9",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* ── Row 1: Header ──────────────────────────────────────────────── */}
      {!isFullscreen && (
        <header
          style={{
            gridRow: 1,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid #0f172a",
            background: "rgba(2,6,23,0.85)",
            backdropFilter: "blur(12px)",
            position: "relative",
            zIndex: 20,
          }}
        >
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
          {/* Share Toggle */}
          <button
            id="share-toggle-btn"
            onClick={() => {
              setShowShare(!showShare);
              setShowInfo(false);
            }}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer border-slate-800 text-slate-400 hover:text-white ${
              showShare ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : ""
            }`}
            title="Share Collection"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Info Toggle */}
          <button
            id="info-toggle-btn"
            onClick={() => {
              setShowInfo(!showInfo);
              setShowShare(false);
            }}
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
    )}


      {/* 3. Share Panel (Absolute Popover Overlay to avoid layout shifts) */}
      {showShare && (
        <div
          ref={sharePanelRef}
          className="absolute right-4 top-18 md:right-8 w-[calc(100vw-32px)] md:w-80 rounded-2xl border border-slate-900 bg-slate-950/95 backdrop-blur-md p-5 text-xs leading-relaxed text-slate-350 z-30 shadow-2xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-sky-400" />
              Share Collection
            </h4>
          </div>
          
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 leading-normal">
              Share this physical-feel presentation link:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={album ? getPublicAlbumUrl(album) : ""}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-900 bg-slate-900/60 text-[10px] text-slate-400 focus:outline-none font-mono"
              />
              <button
                onClick={handleCopyShareLink}
                className="h-9 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedShare ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                Copy
              </button>
            </div>
            
            {/* Native Share on mobile */}
            {typeof navigator.share === "function" && (
              <button
                onClick={handleNativeShare}
                className="w-full h-9 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                Share via Device
              </button>
            )}

            {/* QR Code Segment */}
            <div className="border-t border-slate-900 pt-3 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                <QrCode className="h-3.5 w-3.5 text-sky-400" />
                Printable QR Code
              </div>
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                  {viewerQrCode ? (
                    <img src={viewerQrCode} className="h-full w-full object-contain" alt="QR Code" />
                  ) : (
                    <div className="h-full w-full bg-slate-900/40 animate-pulse rounded" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] text-slate-500 leading-normal">
                    Let guests or clients scan the QR code to open the portfolio on their devices.
                  </p>
                  <button
                    onClick={handleDownloadQR}
                    disabled={!viewerQrCode}
                    className="h-7 px-2.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            </div>

            {album.settings?.passcode && (
              <div className="border-t border-slate-900 pt-3">
                <button
                  onClick={handleLockAlbum}
                  className="w-full h-9 rounded-lg bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Lock Collection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Book Display Area */}
      <main
        style={{
          gridRow: isFullscreen ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: isFullscreen ? "center" : "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          padding: isFullscreen ? "0px" : "12px",
          cursor: "default",
        }}
      >
        {/* Animated equalizer bars for music */}
        {isPlayingMusic && (
          <div className="absolute top-3 left-3 flex gap-0.5 items-end h-4 shrink-0 opacity-60 z-20">
            <span className="w-0.5 h-3 bg-sky-400 animate-pulse" />
            <span className="w-0.5 h-4 bg-sky-400 animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-sky-400 animate-pulse delay-150" />
            <span className="w-0.5 h-3.5 bg-sky-400 animate-pulse delay-100" />
          </div>
        )}

        {/* Book Container — fills available vertical space, perfectly centered */}
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
          {/* BookEngine Wrapper — max-h accounts for header(64) + footer(48) + controls(~140) + paddings(~16) */}
          <div
            ref={containerRef}
            onMouseDown={handlePanMouseDown}
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
            className={`w-full flex justify-center items-center flex-1 min-h-0 relative select-none ${
              zoomScale > 1 ? "overflow-auto" : "overflow-visible"
            }`}
            style={{
              maxHeight: isFullscreen ? "100vh" : "calc(100vh - 272px)",
              width: "100%",
              height: "100%",
              cursor: zoomScale > 1 ? (isPanning ? "grabbing" : "grab") : "default",
            }}
          >
            <div
              style={{
                width: zoomScale > 1 ? `${bookSize.width * zoomScale}px` : "100%",
                height: zoomScale > 1 ? `${bookSize.height * zoomScale}px` : "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "width 0.2s ease, height 0.2s ease",
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 0.2s ease-out",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <BookEngine
                  key={album.id}
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
                  startPage={currentPage}
                  useMouseEvents={zoomScale === 1}
                  onSizeChange={handleSizeChange}
                  isFullscreen={isFullscreen}
                />
              </div>
            </div>
          </div>

          {/* Bottom Controls Area (Pagination, Zoom, Fullscreen, Jump, Thumbnails) */}
          {!isFullscreen && (
            <div className="w-full max-w-4xl flex flex-col items-center gap-3 shrink-0 pb-2 z-10 bg-slate-950/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-900/60">
              {/* Controls Row */}
              <div className="w-full flex flex-wrap items-center justify-between gap-4 px-4">
                
                {/* Left Group: Jump to Page */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Jump to:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value, 10);
                      bookEngineRef.current?.turnToPage(idx);
                    }}
                    className="h-8 px-2 rounded-lg border border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-300 hover:text-white focus:outline-none focus:border-sky-500/50 cursor-pointer"
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      let label = "";
                      if (idx === 0) label = "📖 Cover Page";
                      else if (idx === totalPages - 1) label = "📖 Back Cover";
                      else if (hasFillerPage && idx === totalPages - 2) label = "📖 Filler Page";
                      else {
                        label = `📖 Page ${idx}`;
                      }
                      return (
                        <option key={idx} value={idx}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Middle Group: Navigation & Spread Details */}
                <div className="flex flex-col items-center gap-1">
                  {/* Page Numbers */}
                  {currentPage > 0 && currentPage < totalPages - 1 && (
                    <div id="page-number-display" className="text-[10px] font-mono text-slate-400 tracking-wider">
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
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        bookEngineRef.current?.flipPrev();
                      }}
                      disabled={currentPage === 0}
                      className="h-9 w-9 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous Page"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    
                    <span className="text-xs font-mono tracking-wider font-semibold text-slate-300 select-none min-w-[120px] text-center">
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
                      className="h-9 w-9 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Next Page"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Right Group: Zoom & Fullscreen */}
                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center border border-slate-800 bg-slate-900/40 rounded-lg p-0.5">
                    <button
                      onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
                      disabled={zoomScale <= 1}
                      className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300 w-10 text-center select-none">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomScale(prev => Math.min(2, prev + 0.25))}
                      disabled={zoomScale >= 2}
                      className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </button>
                </div>

              </div>

              {/* Thumbnail Strip */}
              <div className="w-full border-t border-slate-900/80 pt-3 mt-1">
                <div className="w-full overflow-x-auto flex items-center gap-2 pb-1 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800 px-2 h-16">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    let isCurrentVisible = false;
                    if (orientation === "portrait") {
                      isCurrentVisible = currentPage === idx;
                    } else {
                      if (currentPage === 0) {
                        isCurrentVisible = idx === 0;
                      } else if (currentPage === totalPages - 1) {
                        isCurrentVisible = idx === totalPages - 1;
                      } else {
                        if (currentPage % 2 !== 0) {
                          isCurrentVisible = idx === currentPage || idx === currentPage + 1;
                        } else {
                          isCurrentVisible = idx === currentPage - 1 || idx === currentPage;
                        }
                      }
                    }

                    let thumbnailContent: React.ReactNode = null;
                    
                    if (idx === 0) {
                      thumbnailContent = album.coverImage ? (
                        <img src={album.coverImage} className="w-full h-full object-cover" alt="Cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">Cover</div>
                      );
                    } else if (idx === totalPages - 1) {
                      thumbnailContent = (
                        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-[8px] text-slate-500 font-bold uppercase">End</div>
                      );
                    } else if (hasFillerPage && idx === totalPages - 2) {
                      thumbnailContent = (
                        <div className="w-full h-full bg-slate-900/60 flex items-center justify-center text-[8px] text-slate-605">Filler</div>
                      );
                    } else {
                      const photoIdx = idx - 1;
                      const photo = album.photos[photoIdx];
                      if (photo) {
                        thumbnailContent = (
                          <img src={photo.thumbnailUrl || photo.url} className="w-full h-full object-cover" alt={`Page ${idx}`} />
                        );
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => bookEngineRef.current?.turnToPage(idx)}
                        className={`h-12 w-9 rounded overflow-hidden flex-shrink-0 border transition-all cursor-pointer ${
                          isCurrentVisible
                            ? "border-sky-500 scale-[1.05] shadow-lg shadow-sky-500/20"
                            : "border-slate-800/80 hover:border-slate-600"
                        }`}
                        title={idx === 0 ? "Cover Page" : idx === totalPages - 1 ? "Back Cover" : `Page ${idx}`}
                      >
                        {thumbnailContent}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* 4. Footer credits */}
      {!isFullscreen && (
        <footer className="h-12 px-4 border-t flex items-center justify-center z-10 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-slate-900 bg-slate-950/60 shrink-0">
          Powered by SnapFlip
        </footer>
      )}

      {/* Floating Exit Fullscreen button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 50,
            background: "rgba(15,23,42,0.85)",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "10px 20px",
            color: "#f1f5f9",
            fontSize: 11,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            transition: "all 0.2s ease",
          }}
        >
          <Minimize className="h-4 w-4 text-sky-400" />
          Exit Fullscreen
        </button>
      )}

      <ToastContainer />
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
