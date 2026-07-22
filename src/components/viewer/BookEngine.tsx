import React, { useState, useCallback, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";
const HTMLFlipBookAny = HTMLFlipBook as any;
import { getAlbumPageDimensions } from "../../utils/albumUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookPhoto {
  id: string;
  url: string;
  name: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  orientation?: number;
}

export interface BookEngineRef {
  flipNext: () => void;
  flipPrev: () => void;
  reset: () => void;
  turnToPage: (pageIndex: number) => void;
  resize: () => void;
}

interface BookEngineProps {
  photos: BookPhoto[];
  albumSize: string;
  customWidth?: string;
  customHeight?: string;
  detectedSize?: string;
  albumTitle: string;
  coupleName: string;
  watermark: boolean;
  watermarkText: string;
  coverImage?: string;
  maxHeight?: string;
  onPageChange?: (pageIndex: number) => void;
  onOrientationChange?: (orientation: "portrait" | "landscape") => void;
  onInteraction?: () => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  startPage?: number;
  useMouseEvents?: boolean;
  onSizeChange?: (width: number, height: number) => void;
  isFullscreen?: boolean;
}

type PageType = "cover" | "photo" | "filler" | "back-cover";

interface BookPage {
  type: PageType;
  photoIndex?: number;
  isHard: boolean;
}

// ─── ForwardRef Page Component for react-pageflip ─────────────────────────────

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cursor?: string;
}

const BookPage = React.forwardRef<HTMLDivElement, PageProps>(({ children, cursor, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      style={{
        ...props.style,
        position: "absolute",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        cursor: cursor || "default",
      }}
    >
      {children}
    </div>
  );
});
BookPage.displayName = "BookPage";

// ─── Main Component ───────────────────────────────────────────────────────────

const BookEngine = forwardRef<BookEngineRef, BookEngineProps>((
  {
    photos,
    albumSize,
    customWidth,
    customHeight,
    detectedSize,
    albumTitle,
    coupleName,
    watermark,
    watermarkText,
    coverImage,
    maxHeight: _maxHeight,
    onPageChange,
    onOrientationChange,
    onInteraction,
    autoPlay,
    autoPlayInterval,
    startPage = 0,
    useMouseEvents = true,
    onSizeChange,
    isFullscreen = false,
  },
  ref
) => {
  // Build Pages Flat Array first (needed to clamp startPage)
  const pages = useMemo((): BookPage[] => {
    const arr: BookPage[] = [];
    arr.push({ type: "cover", isHard: true });
    for (let i = 0; i < photos.length; i++) {
      arr.push({ type: "photo", photoIndex: i, isHard: false });
    }
    const rawTotal = 1 + photos.length + 1;
    if (rawTotal % 2 !== 0) {
      arr.push({ type: "filler", isHard: false });
    }
    arr.push({ type: "back-cover", isHard: true });
    return arr;
  }, [photos]);

  const totalPages = pages.length;
  const clampedStartPage = Math.max(0, Math.min(startPage, totalPages - 1));

  const [currentPageIndex, setCurrentPageIndex] = useState(clampedStartPage);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const [imagesReady, setImagesReady] = useState(false);
  const [flippingState, setFlippingState] = useState<string>("read");

  const currentCursor = useMemo(() => {
    if (flippingState === "user_fold") return "grabbing";
    if (flippingState === "fold_corner") return "grab";
    return "default";
  }, [flippingState]);

  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const flipBookRef = useRef<any>(null);
  const isProgrammaticRef = useRef(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const forceResize = useCallback(() => {
    const updateSize = () => {
      const container = localContainerRef.current;
      const width = container ? container.clientWidth : window.innerWidth;
      const height = container ? container.clientHeight : window.innerHeight;
      setContainerSize({ width, height });

      const pageFlipInstance = flipBookRef.current?.pageFlip();
      if (pageFlipInstance) {
        try {
          pageFlipInstance.update();
        } catch (err) {
          console.warn("Failed to update flipbook engine size:", err);
        }
      }
    };

    updateSize();
    requestAnimationFrame(updateSize);
    window.setTimeout(updateSize, 120);
    window.setTimeout(updateSize, 280);
  }, []);

  // Preload cover + first two photo pages before revealing the flipbook
  useEffect(() => {
    const srcs: string[] = [];
    if (coverImage) srcs.push(coverImage);
    for (let i = 0; i < Math.min(2, photos.length); i++) {
      const p = photos[i];
      if (p) srcs.push(p.optimizedUrl || p.url);
    }

    if (srcs.length === 0) {
      setImagesReady(true);
      return;
    }

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded >= srcs.length) setImagesReady(true);
    };

    srcs.forEach((src) => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = src;
    });
  }, [coverImage, photos]);

  // Resolve album page dimensions
  const dimensions = useMemo(
    () => getAlbumPageDimensions(albumSize, customWidth, customHeight, detectedSize),
    [albumSize, customWidth, customHeight, detectedSize]
  );

  // Responsive container detection
  useEffect(() => {
    const updateSize = () => {
      const container = localContainerRef.current;
      const width = container ? container.clientWidth : window.innerWidth;
      const height = container ? container.clientHeight : window.innerHeight;
      setContainerSize({ width, height });
    };

    updateSize();

    resizeObserverRef.current = new ResizeObserver(() => {
      updateSize();
    });

    if (localContainerRef.current) {
      resizeObserverRef.current.observe(localContainerRef.current);
    }

    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserverRef.current?.disconnect();
    };
  }, []);



  // Sync internal page changes to parent Viewer
  useEffect(() => {
    onPageChange?.(currentPageIndex);
  }, [currentPageIndex, onPageChange]);

  // Handle Flip Events from HTMLFlipBook
  const handleOnFlip = useCallback((e: { data: number }) => {
    const nextPageIndex = e.data;
    setCurrentPageIndex(nextPageIndex);
    if (!isProgrammaticRef.current) {
      onInteraction?.();
    }
    isProgrammaticRef.current = false;
  }, [onInteraction]);

  // Autoplay Slideshow
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      const pageFlipInstance = flipBookRef.current?.pageFlip();
      if (!pageFlipInstance) return;
      isProgrammaticRef.current = true;
      if (currentPageIndex >= totalPages - 1) {
        pageFlipInstance.turnToPage(0);
      } else {
        pageFlipInstance.turnToNextPage();
      }
    }, autoPlayInterval || 6000);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentPageIndex, totalPages]);

  // Expose forward ref navigation commands — all use the animated pageFlip API
  useImperativeHandle(ref, () => ({
    flipNext: () => {
      isProgrammaticRef.current = true;
      flipBookRef.current?.pageFlip()?.turnToNextPage();
    },
    flipPrev: () => {
      isProgrammaticRef.current = true;
      flipBookRef.current?.pageFlip()?.turnToPrevPage();
    },
    reset: () => {
      isProgrammaticRef.current = true;
      flipBookRef.current?.pageFlip()?.turnToPage(0);
    },
    turnToPage: (pageIndex: number) => {
      isProgrammaticRef.current = true;
      flipBookRef.current?.pageFlip()?.turnToPage(pageIndex);
    },
    resize: forceResize,
  }), [forceResize]);

  // ─── Size Calculation ──────────────────────────────────────────────────────
  //
  // Strategy: Fill the container as much as possible while maintaining aspect ratio.
  // The container is the BookEngine div itself (localContainerRef).
  // We reserve 16px (spine) for double-page mode.
  //
  const pageStyle = useMemo(() => {
    const aspectRatio = dimensions.width / dimensions.height;

    // Use container dimensions if available, otherwise fall back to window
    let availableW: number;
    let availableH: number;

    if (containerSize && containerSize.width > 0 && containerSize.height > 0) {
      availableW = containerSize.width;
      availableH = containerSize.height;
    } else {
      // First render: estimate. Header=64, Footer=48, Controls=~148, Padding=~16 → 276px
      availableW = window.innerWidth;
      availableH = window.innerHeight - (isFullscreen ? 0 : 276);
    }

    // Use nearly the whole viewport in fullscreen while leaving safe page-curl breathing room.
    const scaleFactor = isFullscreen ? 1.0 : 0.98;
    const maxBookW = Math.max(availableW * scaleFactor, 200);
    const maxBookH = Math.max(availableH * scaleFactor, 150);

    const spineW = isSinglePage ? 0 : 16;
    let resolvedW = 0;
    let resolvedH = 0;

    if (isSinglePage) {
      // Single page mode: fit one page into available space
      const byH = maxBookH * aspectRatio;
      if (byH <= maxBookW) {
        resolvedW = byH;
        resolvedH = maxBookH;
      } else {
        resolvedW = maxBookW;
        resolvedH = maxBookW / aspectRatio;
      }
    } else {
      // Double page mode: two pages side by side + spine
      const availForPages = maxBookW - spineW;
      const byH = maxBookH * aspectRatio; // width of one page if height = maxBookH
      if (byH * 2 <= availForPages) {
        resolvedW = byH;
        resolvedH = maxBookH;
      } else {
        resolvedW = availForPages / 2;
        resolvedH = resolvedW / aspectRatio;
      }
    }

    resolvedW = Math.max(Math.round(resolvedW), 100);
    resolvedH = Math.max(Math.round(resolvedH), 80);

    return {
      width: `${resolvedW}px`,
      height: `${resolvedH}px`,
      pageWidth: resolvedW,
      pageHeight: resolvedH,
    };
  }, [dimensions, isSinglePage, containerSize, isFullscreen]);

  const getPhotoFitStyle = useCallback((photo: BookPhoto): React.CSSProperties => {
    const rotation = photo.orientation || 0;
    const isSideways = Math.abs(rotation) % 180 === 90;
    const rawWidth = photo.width && photo.width > 0 ? photo.width : 1;
    const rawHeight = photo.height && photo.height > 0 ? photo.height : 1;
    const photoWidth = isSideways ? rawHeight : rawWidth;
    const photoHeight = isSideways ? rawWidth : rawHeight;

    if (photoWidth <= 1 || photoHeight <= 1) {
      return {
        width: "95%",
        height: "95%",
        objectFit: "contain",
        objectPosition: "center",
      };
    }

    const safePageWidth = pageStyle.pageWidth * 0.95;
    const safePageHeight = pageStyle.pageHeight * 0.95;
    const photoAspect = photoWidth / photoHeight;
    const safePageAspect = safePageWidth / safePageHeight;

    let fittedWidth: number;
    let fittedHeight: number;

    if (photoAspect >= safePageAspect) {
      fittedWidth = safePageWidth;
      fittedHeight = fittedWidth / photoAspect;
    } else {
      fittedHeight = safePageHeight;
      fittedWidth = fittedHeight * photoAspect;
    }

    return {
      width: `${Math.max(1, Math.round(fittedWidth))}px`,
      height: `${Math.max(1, Math.round(fittedHeight))}px`,
      maxWidth: "95%",
      maxHeight: "95%",
      objectFit: "contain",
      objectPosition: "center",
    };
  }, [pageStyle.pageWidth, pageStyle.pageHeight]);

  // Force StPageFlip recalculation when dimensions or fullscreen state changes
  useEffect(() => {
    const pageFlipInstance = flipBookRef.current?.pageFlip();
    if (pageFlipInstance) {
      try {
        pageFlipInstance.update();
      } catch (err) {
        console.warn("Failed to update flipbook engine size:", err);
      }
      
      // Schedule a deferred update to handle layout/reflow propagation delay
      const timer = setTimeout(() => {
        try {
          pageFlipInstance.update();
        } catch {}
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pageStyle.pageWidth, pageStyle.pageHeight, isFullscreen]);

  // Image Rendering
  const renderPageContent = useCallback(
    (page: BookPage, side: "left" | "right", eager: boolean) => {
      if (page.type === "cover") {
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "24px 32px",
              textAlign: "center",
              background: "#020617",
              userSelect: "none",
            }}
          >
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
                loading={eager ? "eager" : "lazy"}
                draggable={false}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(2,6,23,0.8) 0%, transparent 50%, rgba(2,6,23,0.9) 100%)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 10, paddingTop: 16 }}>
              <div
                style={{
                  height: 32, width: 32,
                  margin: "0 auto",
                  borderRadius: "50%",
                  background: "rgba(14,165,233,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
              <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", color: "#38bdf8", display: "block", marginTop: 6 }}>
                Exclusive Showcase
              </span>
            </div>
            <div style={{ position: "relative", zIndex: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
                {albumTitle}
              </h2>
              <div style={{ height: 2, width: 40, background: "#38bdf8", margin: "0 auto 8px" }} />
              <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", letterSpacing: "0.1em", margin: 0 }}>
                {coupleName}
              </p>
            </div>
            <div style={{ position: "relative", zIndex: 10 }}>
              <span style={{ fontSize: 9, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", color: "#475569" }}>
                Staged on SnapFlip
              </span>
            </div>
          </div>
        );
      }

      if (page.type === "back-cover") {
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#020617",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              textAlign: "center",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9" strokeWidth={2} style={{ marginBottom: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#cbd5e1", margin: "0 0 4px" }}>
              The End
            </h4>
            <p style={{ fontSize: 10, color: "#475569", margin: 0 }}>SnapFlip Album Showcase</p>
          </div>
        );
      }

      if (page.type === "filler") {
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#475569", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              End of Album
            </span>
          </div>
        );
      }

      if (page.photoIndex === undefined) return null;
      const photo = photos[page.photoIndex];
      if (!photo) return null;

      const renderSrc = photo.optimizedUrl || photo.url;
      const rotation = photo.orientation || 0;

      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at center, #0c1017 0%, #06080d 70%, #030407 100%)",
            overflow: "hidden",
          }}
        >
          {/* Gutter shadow overlay */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              [side === "left" ? "right" : "left"]: 0,
              width: 35,
              background: side === "left"
                ? "linear-gradient(to left, rgba(0,0,0,0.3), transparent)"
                : "linear-gradient(to right, rgba(0,0,0,0.3), transparent)",
              zIndex: 4,
              pointerEvents: "none",
            }}
          />
          {eager ? (
            <img
              src={renderSrc}
              alt={photo.name}
              style={{
                ...getPhotoFitStyle(photo),
                display: "block",
                pointerEvents: "none",
                ...(rotation ? { transform: `rotate(${rotation}deg)` } : {}),
              }}
              loading="eager"
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 10, color: "#374151", fontFamily: "monospace", letterSpacing: "0.15em" }}>
                loading…
              </span>
            </div>
          )}
          {watermark && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "4px 10px",
                  borderRadius: 4,
                  transform: "rotate(12deg)",
                }}
              >
                © {watermarkText}
              </span>
            </div>
          )}
        </div>
      );
    },
    [photos, coverImage, albumTitle, coupleName, watermark, watermarkText, getPhotoFitStyle]
  );

  const spineWidth = isSinglePage ? 0 : 16;
  const bookWidth = isSinglePage ? pageStyle.pageWidth : pageStyle.pageWidth * 2 + spineWidth;
  const bookHeight = pageStyle.pageHeight;

  // Report computed dimensions to parent Viewer
  useEffect(() => {
    onSizeChange?.(bookWidth, bookHeight);
  }, [bookWidth, bookHeight, onSizeChange]);

  // Preload nearby images to eliminate flickering during turn transitions
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const startRange = Math.max(0, currentPageIndex - 3);
    const endRange = Math.min(pages.length - 1, currentPageIndex + 3);
    for (let i = startRange; i <= endRange; i++) {
      const page = pages[i];
      if (page && page.photoIndex !== undefined) {
        const photo = photos[page.photoIndex];
        if (photo) {
          const src = photo.optimizedUrl || photo.url;
          const img = new Image();
          img.src = src;
        }
      }
    }
  }, [currentPageIndex, pages, photos]);

  // Click-to-flip handlers
  const handleClickLeft = useCallback(() => {
    if (!useMouseEvents) return;
    flipBookRef.current?.pageFlip()?.turnToPrevPage();
  }, [useMouseEvents]);

  const handleClickRight = useCallback(() => {
    if (!useMouseEvents) return;
    flipBookRef.current?.pageFlip()?.turnToNextPage();
  }, [useMouseEvents]);

  // Loading shimmer
  if (!imagesReady) {
    return (
      <div
        ref={localContainerRef}
        role="region"
        aria-label="Album viewer"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          userSelect: "none",
          cursor: currentCursor,
        }}
      >
        <div
          style={{
            width: Math.max(bookWidth, 400),
            height: Math.max(bookHeight, 300),
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 10, color: "#374151", fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Preparing Album…
          </span>
        </div>
      </div>
    );
  }

  const resolvedAspectRatio = isSinglePage
    ? `${dimensions.width} / ${dimensions.height}`
    : `${dimensions.width * 2 + 16} / ${dimensions.height}`;

  return (
    <div
      ref={localContainerRef}
      role="region"
      aria-label="Album viewer"
      aria-roledescription="flipbook"
      style={{
        position: "relative",
        display: "flex",           // ← explicit inline flex, not relying on CSS class
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: isFullscreen ? "100vh" : "100%",
        maxHeight: isFullscreen ? "100vh" : "100%",
        maxWidth: isFullscreen ? "100%" : "100%",
        aspectRatio: isFullscreen ? resolvedAspectRatio : undefined,
        objectFit: "contain",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        overflow: "visible",       // allow page-curl to render outside
        cursor: currentCursor,
      }}
    >
      {/* Book wrapper — sized exactly to the computed bookWidth × bookHeight */}
      <div
        style={{
          position: "relative",
          width: bookWidth,
          height: bookHeight,
          flexShrink: 0,
          overflow: "visible",
        }}
      >
        {/* Outer glow / shadow */}
        <div
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 14,
            boxShadow: "0 30px 70px -15px rgba(0,0,0,0.85), 0 15px 35px -10px rgba(0,0,0,0.65), 0 5px 15px -5px rgba(0,0,0,0.45)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        {/* Spine */}
        {!isSinglePage && currentPageIndex > 0 && currentPageIndex < totalPages - 1 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 16,
              left: pageStyle.pageWidth + spineWidth / 2,
              transform: "translateX(-50%)",
              background: "linear-gradient(90deg, #05080f 0%, #0d131f 25%, #141b29 50%, #0d131f 75%, #05080f 100%)",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.85), 0 0 15px rgba(0,0,0,0.6)",
              zIndex: 10,
              borderRadius: 1,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Pages container */}
        <div
          style={{
            position: "relative",
            display: "block",
            width: bookWidth,
            height: bookHeight,
            overflow: "visible",    // CRITICAL: allow curl to paint outside
          }}
        >
          {/* StPageFlip Component */}
          <HTMLFlipBookAny
            width={pageStyle.pageWidth}
            height={pageStyle.pageHeight}
            size="fixed"             // use "fixed" so our computed dimensions are used exactly
            minWidth={pageStyle.pageWidth}
            maxWidth={pageStyle.pageWidth}
            minHeight={pageStyle.pageHeight}
            maxHeight={pageStyle.pageHeight}
            drawShadow={true}
            maxShadowOpacity={0.5}
            showCover={true}
            usePortrait={true}
            mobileScrollSupport={true}
            useMouseEvents={useMouseEvents}
            startPage={clampedStartPage}
            onFlip={handleOnFlip}
            onInit={(e: any) => {
              const mode = e.data.mode;
              setIsSinglePage(mode === "portrait");
              onOrientationChange?.(mode);
            }}
            onChangeOrientation={(e: any) => {
              const mode = e.data;
              setIsSinglePage(mode === "portrait");
              onOrientationChange?.(mode);
            }}
            onChangeState={(e: any) => {
              setFlippingState(e.data);
            }}
            ref={flipBookRef}
            style={{ display: "block", overflow: "visible", cursor: currentCursor }}
          >
            {pages.map((page, index) => {
              const isLoaded = Math.abs(index - currentPageIndex) <= 2;
              let side: "left" | "right" = "right";
              if (index === 0) {
                side = "right";
              } else if (index === pages.length - 1) {
                side = "left";
              } else {
                side = index % 2 !== 0 ? "left" : "right";
              }

              return (
                <BookPage key={index} data-density={page.isHard ? "hard" : "soft"} cursor={currentCursor}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      background: page.isHard
                        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                        : "#0c111a",
                      boxShadow: page.isHard
                        ? "inset 0 0 50px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,255,255,0.05)"
                        : "inset 0 0 35px rgba(0,0,0,0.45)",
                      borderRadius: side === "left" ? "12px 0 0 12px" : "0 12px 12px 0",
                      overflow: "hidden",
                    }}
                  >
                    {renderPageContent(page, side, isLoaded)}
                  </div>
                </BookPage>
              );
            })}
          </HTMLFlipBookAny>
        </div>

        {/* Click-to-flip overlay zones (desktop only) */}
        {useMouseEvents && (
          <>
            <div
              onClick={handleClickLeft}
              aria-label="Previous page"
              role="button"
              tabIndex={-1}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "50%",
                zIndex: 20,
                cursor: currentCursor,
                background: "transparent",
              }}
            />
            <div
              onClick={handleClickRight}
              aria-label="Next page"
              role="button"
              tabIndex={-1}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: "50%",
                zIndex: 20,
                cursor: currentCursor,
                background: "transparent",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
});

BookEngine.displayName = "BookEngine";

export default React.memo(BookEngine);
