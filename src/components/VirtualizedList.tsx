import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type VirtualizedListProps<T> = {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  loadMoreThreshold?: number;
};

export function VirtualizedList<T>({
  items,
  estimatedItemHeight = 600,
  containerHeight,
  renderItem,
  overscan = 3,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  loadMoreThreshold = 200,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const itemHeights = useRef<Map<number, number>>(new Map());
  const itemOffsets = useRef<Map<number, number>>(new Map());

  // Clear cached heights when items change
  useEffect(() => {
    itemHeights.current.clear();
    itemOffsets.current.clear();
    itemRefs.current.clear();
  }, [items.length]);

  // Calculate total height and offsets based on measured heights
  const calculateLayout = useCallback(() => {
    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      itemOffsets.current.set(i, offset);
      const height = itemHeights.current.get(i) || estimatedItemHeight;
      offset += height;
    }
    return offset;
  }, [items.length, estimatedItemHeight]);

  const totalHeight = calculateLayout();

  // Find visible items based on scroll position
  const getVisibleRange = useCallback(() => {
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = itemOffsets.current.get(mid) || 0;
      const height = itemHeights.current.get(mid) || estimatedItemHeight;

      if (offset + height < scrollTop) {
        low = mid + 1;
      } else if (offset > scrollTop) {
        high = mid - 1;
      } else {
        startIndex = mid;
        break;
      }
    }
    startIndex = Math.max(0, Math.min(low, startIndex) - overscan);

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    for (let i = startIndex; i < items.length; i++) {
      const offset = itemOffsets.current.get(i) || 0;
      if (offset > viewportBottom) {
        endIndex = i;
        break;
      }
    }
    endIndex = Math.min(items.length - 1, endIndex + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, overscan, estimatedItemHeight]);

  const { startIndex, endIndex } = getVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Measure item height when it's rendered
  const measureItem = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element && !itemHeights.current.has(index)) {
      const height = element.getBoundingClientRect().height;
      itemHeights.current.set(index, height);
      itemRefs.current.set(index, element);
    }
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if we should load more
    if (onLoadMore && hasMore && !isLoading) {
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (scrollBottom < loadMoreThreshold) {
        onLoadMore();
      }
    }
  }, [onLoadMore, hasMore, isLoading, loadMoreThreshold]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
      }}
      role="list"
      tabIndex={0}
      aria-label="Scrollable list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const top = itemOffsets.current.get(actualIndex) || 0;
          
          return (
            <div
              key={actualIndex}
              ref={(el) => measureItem(actualIndex, el)}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                minHeight: estimatedItemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
        
        {/* Loading indicator at bottom */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: totalHeight,
              left: 0,
              right: 0,
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            role="status"
            aria-live="polite"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
