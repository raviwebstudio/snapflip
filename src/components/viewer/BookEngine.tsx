import React, { useState, useCallback, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { useBookInteraction } from "../../hooks/useBookInteraction";
import { getAlbumPageDimensions } from "../../utils/albumUtils";
import "./BookEngine.css";

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
  /** Override the page max-height (default: calc(100vh - 220px)). Pass a CSS value like '380px'. */
  maxHeight?: string;
  onPageChange?: (pageIndex: number) => void;
  onOrientationChange?: (orientation: "portrait" | "landscape") => void;
  onInteraction?: () => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// ─── Leaf-based Page Types ────────────────────────────────────────────────────

type PageType = "cover" | "photo" | "filler" | "back-cover";

interface BookPage {
  type: PageType;
  photoIndex?: number;
  isHard: boolean;
}

interface BookLeaf {
  leafIndex: number;
  front: BookPage;
  back: BookPage;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BookEngine = forwardRef<BookEngineRef, BookEngineProps>(({
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
  maxHeight,
  onPageChange,
  onOrientationChange,
  onInteraction,
  autoPlay,
  autoPlayInterval,
}, ref) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const localContainerRef = useRef<HTMLDivElement | null>(null);

  // Track active leaf indices that are being animated/transitioned
  const [animatingLeaf, setAnimatingLeaf] = useState<{
    leafIndex: number;
    direction: "forward" | "backward";
  } | null>(null);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const bookWrapperRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Build Pages Flat Array
  const pages = useMemo((): BookPage[] => {
    const arr: BookPage[] = [];

    // Front Cover (hard)
    arr.push({ type: "cover", isHard: true });

    // Photo Pages (soft)
    for (let i = 0; i < photos.length; i++) {
      arr.push({ type: "photo", photoIndex: i, isHard: false });
    }

    // Check if odd and need filler page
    const rawTotal = 1 + photos.length + 1; // cover + photos + backcover
    if (rawTotal % 2 !== 0) {
      arr.push({ type: "filler", isHard: false });
    }

    // Back Cover (hard)
    arr.push({ type: "back-cover", isHard: true });

    return arr;
  }, [photos.length]);

  const totalPages = pages.length;

  // 2. Group Pages into Leaves (Two pages per sheet of paper)
  // Leaf 0: Front Cover (Front) / Page 1 (Back)
  // Leaf 1: Page 2 (Front) / Page 3 (Back)
  // ...
  const leaves = useMemo((): BookLeaf[] => {
    const arr: BookLeaf[] = [];
    const numLeaves = Math.ceil(totalPages / 2);

    for (let i = 0; i < numLeaves; i++) {
      arr.push({
        leafIndex: i,
        front: pages[i * 2],
        back: pages[i * 2 + 1] || { type: "filler", isHard: true },
      });
    }
    return arr;
  }, [pages, totalPages]);

  const totalLeaves = leaves.length;

  // Current active leaf
  const currentLeaf = useMemo(() => {
    if (isSinglePage) {
      return Math.floor(currentPage / 2);
    }
    return Math.ceil(currentPage / 2);
  }, [currentPage, isSinglePage]);

  // Page Dimensions Aspect Ratio resolution
  const dimensions = useMemo(
    () => getAlbumPageDimensions(albumSize, customWidth, customHeight, detectedSize),
    [albumSize, customWidth, customHeight, detectedSize]
  );

  // Handle responsive viewport single/double spread detection
  useEffect(() => {
    const checkSinglePage = () => {
      const container = localContainerRef.current;
      const width = container ? container.clientWidth : window.innerWidth;
      const height = container ? container.clientHeight : window.innerHeight;

      // Force single page if width < 769 OR short container height
      const newSinglePage = width < 769 || (height < 500 && width < 950);
      setIsSinglePage(newSinglePage);
      onOrientationChange?.(newSinglePage ? "portrait" : "landscape");
      
      setContainerSize({ width, height });
    };

    checkSinglePage();

    resizeObserverRef.current = new ResizeObserver(() => {
      checkSinglePage();
    });

    if (localContainerRef.current) {
      resizeObserverRef.current.observe(localContainerRef.current);
    }

    window.addEventListener("resize", checkSinglePage);
    return () => {
      window.removeEventListener("resize", checkSinglePage);
      resizeObserverRef.current?.disconnect();
    };
  }, [onOrientationChange]);

  // Sync internal page changes back to parent Viewer
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  // Motion reduction configuration checks
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flipDuration = prefersReducedMotion ? 50 : 700;

  // ─── Flip Controls ─────────────────────────────────────────────────────────

  const handleFlipForward = useCallback(() => {
    if (isAnimating) return;

    if (isSinglePage) {
      if (currentPage >= totalPages - 1) return;
      setIsAnimating(true);
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 300);
      return;
    }

    if (currentLeaf >= totalLeaves - 1) return;

    const targetLeaf = currentLeaf; // The leaf turning to the left
    setAnimatingLeaf({ leafIndex: targetLeaf, direction: "forward" });
    setIsAnimating(true);

    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingLeaf(null);
      setIsAnimating(false);
      setCurrentPage((prev) => Math.min(prev + 2, totalPages - 1));
    }, flipDuration);
  }, [isAnimating, currentLeaf, totalLeaves, totalPages, isSinglePage, currentPage, flipDuration]);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      if (currentPage >= totalPages - 1) {
        setCurrentPage(0);
      } else {
        handleFlipForward();
      }
    }, autoPlayInterval || 6000);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentPage, totalPages, handleFlipForward]);

  const handleFlipBackward = useCallback(() => {
    if (isAnimating) return;

    if (isSinglePage) {
      if (currentPage <= 0) return;
      setIsAnimating(true);
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 300);
      return;
    }

    if (currentLeaf <= 0) return;

    const targetLeaf = currentLeaf - 1; // The leaf turning back to the right
    setAnimatingLeaf({ leafIndex: targetLeaf, direction: "backward" });
    setIsAnimating(true);

    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingLeaf(null);
      setIsAnimating(false);
      setCurrentPage((prev) => Math.max(prev - 2, 0));
    }, flipDuration);
  }, [isAnimating, currentLeaf, isSinglePage, currentPage, flipDuration]);

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  // Expose forward ref navigation commands
  useImperativeHandle(ref, () => ({
    flipNext: handleFlipForward,
    flipPrev: handleFlipBackward,
    reset: () => setCurrentPage(0),
  }));

  // ─── Interaction Hook ──────────────────────────────────────────────────────

  const { containerRef, dragProgress, isDragging, dragDirection } = useBookInteraction({
    onNext: handleFlipForward,
    onPrev: handleFlipBackward,
    isAnimating,
    isFirstPage: currentPage === 0,
    isLastPage: currentPage >= totalPages - 1,
    isSinglePage,
    onInteraction,
  });

  // Calculate live drag transformation values for active leaf
  const getDragStyle = (leafIdx: number) => {
    if (!isDragging || isSinglePage) return undefined;

    // Forward drag (turning next): active leaf is currentLeaf
    if (dragDirection === -1 && leafIdx === currentLeaf) {
      const angle = -180 * dragProgress;
      return {
        transform: `rotateY(${angle}deg)`,
        transition: "none",
        zIndex: 50,
      };
    }

    // Backward drag (turning prev): active leaf is currentLeaf - 1
    if (dragDirection === 1 && leafIdx === currentLeaf - 1) {
      const angle = -180 + (180 * dragProgress);
      return {
        transform: `rotateY(${angle}deg)`,
        transition: "none",
        zIndex: 50,
      };
    }

    return undefined;
  };

  // ─── Responsive Dimensions styling ──────────────────────────────────────────

  const pageStyle = useMemo(() => {
    const aspectRatio = dimensions.width / dimensions.height;
    
    // Determine the baseline available dimensions
    let availableW = window.innerWidth;
    let availableH = window.innerHeight;
    let limitH = availableH - 220;

    if (containerSize) {
      availableW = containerSize.width;
      availableH = containerSize.height;
      // Since container is already constrained by layout, just use its height with small padding
      limitH = availableH - 20;
    } else if (maxHeight) {
      const parsed = parseInt(maxHeight, 10);
      if (!isNaN(parsed)) {
        limitH = parsed;
      }
    }
    const maxBookW = Math.max(availableW - 40, 200);
    const maxBookH = Math.max(limitH, 150);

    const currentSpineWidth = isSinglePage ? 0 : 16;
    let resolvedW = 0;
    let resolvedH = 0;

    if (isSinglePage) {
      // Single page aspect ratio constraint
      const testH = maxBookH;
      const testW = testH * aspectRatio;
      if (testW <= maxBookW) {
        resolvedW = testW;
        resolvedH = testH;
      } else {
        resolvedW = maxBookW;
        resolvedH = resolvedW / aspectRatio;
      }
    } else {
      // Double spread aspect ratio constraint (width of one page)
      const maxAvailableW = maxBookW - currentSpineWidth;
      const testH = maxBookH;
      const testW = testH * aspectRatio;
      if (testW * 2 <= maxAvailableW) {
        resolvedW = testW;
        resolvedH = testH;
      } else {
        resolvedW = maxAvailableW / 2;
        resolvedH = resolvedW / aspectRatio;
      }
    }

    // Round to avoid pixel rendering sub-pixel glitches
    resolvedW = Math.round(resolvedW);
    resolvedH = Math.round(resolvedH);

    return {
      aspectRatio: `${dimensions.width} / ${dimensions.height}`,
      width: `${resolvedW}px`,
      height: `${resolvedH}px`,
      maxWidth: "unset",
      maxHeight: "unset",
    };
  }, [dimensions, isSinglePage, containerSize, maxHeight]);

  const spineWidth = isSinglePage ? 0 : 16;

  const bookDimensions = useMemo(() => {
    const pw = parseInt(pageStyle.width, 10) || 0;
    const ph = parseInt(pageStyle.height, 10) || 0;
    const bookWidth = isSinglePage ? pw : pw * 2 + spineWidth;
    return {
      width: `${bookWidth}px`,
      height: `${ph}px`,
      pageWidth: pw,
      pageHeight: ph,
    };
  }, [pageStyle, isSinglePage, spineWidth]);



  // ─── Image Rendering block ────────────────────────────────────────────────

  const renderPageContent = useCallback(
    (page: BookPage, side: "left" | "right", eager: boolean) => {
      if (page.type === "cover") {
        return (
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 text-center bg-slate-950 select-none">
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover"
                className="absolute inset-0 h-full w-full object-cover opacity-40 pointer-events-none"
                loading={eager ? "eager" : "lazy"}
                draggable={false}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 z-0 pointer-events-none" />

            <div className="relative z-10 space-y-2 pt-4 pointer-events-none">
              <div className="h-8 w-8 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-sky-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                  />
                </svg>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-sky-400 block">
                Exclusive Showcase
              </span>
            </div>

            <div className="relative z-10 space-y-3 pointer-events-none">
              <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight uppercase tracking-wider">
                {albumTitle}
              </h2>
              <div className="h-0.5 w-10 bg-sky-400 mx-auto" />
              <p className="text-xs text-slate-400 font-mono tracking-widest">
                {coupleName}
              </p>
            </div>

            <div className="relative z-10 pointer-events-none">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                Staged on SnapFlip
              </span>
            </div>
          </div>
        );
      }

      if (page.type === "back-cover") {
        return (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none pointer-events-none">
            <svg
              className="h-8 w-8 text-sky-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-350">
              The End
            </h4>
            <p className="text-[10px] text-slate-600 mt-1">
              SnapFlip Album Showcase
            </p>
          </div>
        );
      }

      if (page.type === "filler") {
        return (
          <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-8 text-center select-none pointer-events-none">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
              End of Album
            </span>
          </div>
        );
      }

      if (page.photoIndex === undefined) return null;
      const photo = photos[page.photoIndex];
      if (!photo) return null;

      // Use optimized URL if present for rendering inside the book spread to save memory
      const renderSrc = photo.optimizedUrl || photo.url;
      const rotation = photo.orientation || 0;
      const rotationStyle = rotation ? { transform: `rotate(${rotation}deg)` } : undefined;

      return (
        <div className={`book-page-image-wrapper ${side === "left" ? "book-page-content--left" : "book-page-content--right"}`}>
          <img
            src={renderSrc}
            alt={photo.name}
            style={rotationStyle}
            className="book-page-image"
            loading={eager ? "eager" : "lazy"}
            draggable={false}
          />
          {watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
              <span className="text-[9px] uppercase font-bold tracking-widest text-white/20 border border-white/15 px-2.5 py-1 rounded rotate-12">
                © {watermarkText}
              </span>
            </div>
          )}
        </div>
      );
    },
    [photos, coverImage, albumTitle, coupleName, watermark, watermarkText]
  );

  // Determine if book cover is closed
  const isBookClosed = currentPage === 0;

  return (
    <div
      className="book-engine"
      ref={(node) => {
        localContainerRef.current = node;
        if (containerRef) {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      role="region"
      aria-label="Album viewer"
      aria-roledescription="flipbook"
      style={{ touchAction: "none" }} // Prevents default touch swipes from disrupting gestures
    >
      <div
        ref={bookWrapperRef}
        className={`book-wrapper ${isSinglePage ? "book-wrapper--single" : ""}`}
        style={{
          width: bookDimensions.width,
          height: bookDimensions.height,
        }}
      >
        <div className="book-shadow" />

        {!isSinglePage && !isBookClosed && (
          <div
            className="book-spine"
            style={{ left: `${bookDimensions.pageWidth + spineWidth / 2}px` }}
          />
        )}

        <div
          className="book-pages"
          style={{
            width: bookDimensions.width,
            height: bookDimensions.height,
          }}
        >
          {leaves.map((leaf, index) => {
            const isLeft = index < currentLeaf;
            const isRight = index > currentLeaf;
            const isActive = index === currentLeaf;

            // ─── LAZY RENDERING WINDOW ──────────────────────────────────────────
            // Render only currentLeaf, previous leaf and next leaf (active window of 3 sheets)
            const isOutsideActiveRange = Math.abs(index - currentLeaf) > 1;

            if (isOutsideActiveRange && index > 0 && index < totalLeaves - 1) {
              // Return lightweight blank sheet to save GPU memory for large albums
              return (
                <div
                  key={`leaf-placeholder-${index}`}
                  className="book-leaf-placeholder"
                  style={{ display: "none" }}
                />
              );
            }

            // Calculate rotation style based on leaf position
            let rotateAngle = 0;
            if (isSinglePage) {
              rotateAngle = (index < currentLeaf || (index === currentLeaf && currentPage % 2 !== 0)) ? -180 : 0;
            } else {
              if (isLeft) {
                rotateAngle = -180;
              } else if (isRight) {
                rotateAngle = 0;
              } else if (isActive) {
                rotateAngle = 0;
              }
            }

            // Override angle if this leaf is animating
            let isLeafAnimating = false;
            let animClass = "";

            if (animatingLeaf && animatingLeaf.leafIndex === index) {
              isLeafAnimating = true;
              animClass =
                animatingLeaf.direction === "forward"
                  ? "book-page-wrapper--flipping"
                  : "book-page-wrapper--flipping-back";
            }

            // Calculate dynamic layer stacking orders
            let zIndex = totalLeaves - index;
            if (isLeft) {
              zIndex = index;
            } else if (isLeafAnimating) {
              zIndex = 100;
            }

            const dragOverride = getDragStyle(index);
            const leafLeft = isSinglePage ? 0 : bookDimensions.pageWidth + spineWidth;
            const leafOrigin = isSinglePage ? "center center" : `-${spineWidth / 2}px center`;

            return (
              <div
                key={`leaf-${index}`}
                className={`book-page-wrapper ${leaf.front.isHard || leaf.back.isHard ? "book-page-wrapper--hard" : ""} ${animClass}`}
                style={{
                  ...pageStyle,
                  zIndex,
                  transformOrigin: leafOrigin,
                  position: "absolute",
                  left: `${leafLeft}px`,
                  top: 0,
                  display: isSinglePage && !isActive && !isLeafAnimating ? "none" : undefined,
                  transform: `rotateY(${rotateAngle}deg)`,
                  transition: isLeafAnimating ? `transform ${flipDuration}ms cubic-bezier(0.645, 0.045, 0.355, 1)` : undefined,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  ...dragOverride,
                }}
              >
                {/* Front Side of sheet (Visible when rotated between 0 and -90 deg) */}
                <div
                  className={`book-page-content ${leaf.front.isHard ? "book-page-content--hard" : ""} book-page-content--front`}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    borderRadius: index === 0 ? "0 12px 12px 0" : "0 12px 12px 0",
                    overflow: "hidden",
                  }}
                >
                  {renderPageContent(leaf.front, "right", Math.abs(index - currentLeaf) <= 1)}
                </div>

                {/* Back Side of sheet (Visible when rotated between -90 and -180 deg) */}
                <div
                  className={`book-page-content ${leaf.back.isHard ? "book-page-content--hard" : ""} book-page-content--back`}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    borderRadius: "12px 0 0 12px",
                    overflow: "hidden",
                  }}
                >
                  {renderPageContent(leaf.back, "left", Math.abs(index - currentLeaf) <= 1)}
                </div>

                {/* Corner hints */}
                {!leaf.front.isHard && !isLeft && (
                  <div className="book-corner-hint book-corner-hint--right" />
                )}
                {!leaf.back.isHard && isLeft && (
                  <div className="book-corner-hint book-corner-hint--left" />
                )}

                {/* Dynamic flip shadow layer */}
                <div className="book-page-shadow" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

BookEngine.displayName = "BookEngine";

export default React.memo(BookEngine);
