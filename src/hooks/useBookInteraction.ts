import { useRef, useCallback, useEffect } from "react";

/**
 * Pointer interaction state used during drag gestures.
 */
interface DragState {
  /** Whether a drag is currently in progress */
  isDragging: boolean;
  /** X coordinate where the drag started */
  startX: number;
  /** Y coordinate where the drag started */
  startY: number;
  /** Timestamp when the drag started (for velocity calculation) */
  startTime: number;
  /** Current X position during drag */
  currentX: number;
  /** Direction the user is dragging: -1 = forward (right-to-left), 1 = backward (left-to-right) */
  direction: -1 | 1 | 0;
}

interface UseBookInteractionOptions {
  /** Callback to flip to the next page */
  onNext: () => void;
  /** Callback to flip to the previous page */
  onPrev: () => void;
  /** Whether the book engine is currently animating a flip */
  isAnimating: boolean;
  /** Whether this is the first page (disable prev) */
  isFirstPage: boolean;
  /** Whether this is the last page (disable next) */
  isLastPage: boolean;
  /** Whether the book is in single-page (portrait/mobile) mode */
  isSinglePage: boolean;
}

interface UseBookInteractionReturn {
  /** Ref to attach to the book container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current drag progress as a value from 0 to 1 */
  dragProgress: number;
  /** Whether a drag gesture is currently in progress */
  isDragging: boolean;
  /** Direction of the current drag: -1 = forward, 1 = backward, 0 = none */
  dragDirection: -1 | 1 | 0;
}

/**
 * Custom hook that handles all book interaction: pointer drag, touch swipe, 
 * click on page halves, and keyboard arrow navigation.
 * 
 * Uses PointerEvents for unified mouse + touch handling.
 */
export function useBookInteraction({
  onNext,
  onPrev,
  isAnimating,
  isFirstPage,
  isLastPage,
  isSinglePage,
}: UseBookInteractionOptions): UseBookInteractionReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    direction: 0,
  });
  const dragProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragDirectionRef = useRef<-1 | 1 | 0>(0);

  // We use a state-update trigger to re-render when drag progress changes
  // but throttle it to animation frames for 60fps
  const rafRef = useRef<number | null>(null);
  const forceUpdateRef = useRef(0);
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
  }, []);

  // Minimum drag distance in pixels to trigger a page flip
  const DRAG_THRESHOLD = 60;
  // Minimum swipe velocity (px/ms) for a flick gesture
  const FLICK_VELOCITY = 0.3;

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (isAnimating) return;
      const container = containerRef.current;
      if (!container) return;

      // Only handle primary button (left click / single touch)
      if (e.button !== 0) return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;

      dragStateRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        currentX: e.clientX,
        direction: 0,
      };

      isDraggingRef.current = true;
      dragProgressRef.current = 0;
      dragDirectionRef.current = 0;

      // Determine initial drag direction based on which half was clicked
      const halfPoint = rect.width / 2;
      if (isSinglePage) {
        // In single page mode, left third = prev, right third = next
        if (relX < rect.width * 0.33) {
          dragStateRef.current.direction = 1; // backward
          dragDirectionRef.current = 1;
        } else {
          dragStateRef.current.direction = -1; // forward
          dragDirectionRef.current = -1;
        }
      } else {
        if (relX < halfPoint) {
          dragStateRef.current.direction = 1; // backward (left page)
          dragDirectionRef.current = 1;
        } else {
          dragStateRef.current.direction = -1; // forward (right page)
          dragDirectionRef.current = -1;
        }
      }

      container.setPointerCapture(e.pointerId);
    },
    [isAnimating, isSinglePage]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragStateRef.current.isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      dragStateRef.current.currentX = e.clientX;
      const deltaX = e.clientX - dragStateRef.current.startX;
      const containerWidth = container.getBoundingClientRect().width;
      const halfWidth = isSinglePage ? containerWidth : containerWidth / 2;

      // Calculate progress (0 to 1)
      const progress = Math.min(Math.abs(deltaX) / halfWidth, 1);
      dragProgressRef.current = progress;

      // Update direction based on actual drag movement
      if (Math.abs(deltaX) > 10) {
        const newDir = deltaX > 0 ? 1 : -1;
        dragStateRef.current.direction = newDir as -1 | 1;
        dragDirectionRef.current = newDir as -1 | 1;
      }

      // Request animation frame for smooth rendering
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        forceUpdate();
      });
    },
    [isSinglePage, forceUpdate]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragStateRef.current.isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      const drag = dragStateRef.current;
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      const elapsed = Date.now() - drag.startTime;
      const velocity = Math.abs(deltaX) / elapsed;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Reset drag state
      dragStateRef.current.isDragging = false;
      isDraggingRef.current = false;
      dragProgressRef.current = 0;
      dragDirectionRef.current = 0;

      // Determine if this was a valid horizontal gesture (not vertical scroll)
      const isHorizontal = absDeltaX > absDeltaY * 0.7;

      if (isHorizontal && (absDeltaX > DRAG_THRESHOLD || velocity > FLICK_VELOCITY)) {
        // Swipe/drag gesture completed
        if (deltaX < 0 && !isLastPage) {
          onNext();
        } else if (deltaX > 0 && !isFirstPage) {
          onPrev();
        }
      } else if (absDeltaX < 5 && absDeltaY < 5) {
        // This was a click (no drag movement)
        const rect = container.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const halfPoint = rect.width / 2;

        if (isSinglePage) {
          if (relX < rect.width * 0.33 && !isFirstPage) {
            onPrev();
          } else if (relX > rect.width * 0.67 && !isLastPage) {
            onNext();
          }
        } else {
          if (relX < halfPoint && !isFirstPage) {
            onPrev();
          } else if (relX >= halfPoint && !isLastPage) {
            onNext();
          }
        }
      }

      container.releasePointerCapture(e.pointerId);
      forceUpdate();
    },
    [onNext, onPrev, isFirstPage, isLastPage, isSinglePage, forceUpdate]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === "ArrowRight" || e.key === "Right") {
        if (!isLastPage) onNext();
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        if (!isFirstPage) onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, isAnimating, isFirstPage, isLastPage]);

  // Attach pointer event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Force a render cycle to read refs (the void usage prevents unused-var lint)
  void forceUpdateRef.current;

  return {
    containerRef,
    dragProgress: dragProgressRef.current,
    isDragging: isDraggingRef.current,
    dragDirection: dragDirectionRef.current,
  };
}
