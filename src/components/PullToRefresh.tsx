import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, WifiOff } from "lucide-react";

type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  isOffline?: boolean;
};

export function PullToRefresh({ onRefresh, children, isOffline = false }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, MAX_PULL));
      
      if (distance > 20) {
        e.preventDefault();
      }
    }
  }, [isRefreshing, MAX_PULL]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      if (isOffline) {
        setIsPulling(false);
        setPullDistance(0);
        startY.current = 0;
        return;
      }

      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
    startY.current = 0;
  }, [pullDistance, PULL_THRESHOLD, isRefreshing, isOffline, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const shouldTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm border-b transition-all duration-200"
          style={{
            height: isRefreshing ? "60px" : `${Math.min(pullDistance, 60)}px`,
            opacity: isRefreshing ? 1 : pullProgress,
          }}
        >
          {isOffline ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <WifiOff className="h-5 w-5" />
              <span className="text-sm">You're offline</span>
            </div>
          ) : isRefreshing ? (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div
                className="transition-transform duration-200"
                style={{
                  transform: shouldTrigger ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <span className="text-xs text-muted-foreground">
                {shouldTrigger ? "Release to refresh" : "Pull to refresh"}
              </span>
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
