import { useCallback, useRef } from 'react';

/**
 * Optimized callback hook that uses requestAnimationFrame
 * for better performance on frequent updates
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const rafRef = useRef<number | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    }) as T,
    deps
  );
}
