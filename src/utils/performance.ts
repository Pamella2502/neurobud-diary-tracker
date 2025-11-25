/**
 * Performance utilities for optimizing app behavior
 */

/**
 * Debounce function with requestAnimationFrame
 * Best for UI updates and animations
 */
export function debounceRAF<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 16
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        func(...args);
      });
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function with requestAnimationFrame
 * Limits execution to once per animation frame
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    lastArgs = args;

    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      if (lastArgs !== null) {
        func(...lastArgs);
      }
      rafId = null;
      lastArgs = null;
    });
  };
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Prefetch a route by dynamically importing it
 */
export function prefetchRoute(routePath: string): void {
  const routeMap: Record<string, () => Promise<any>> = {
    '/auth': () => import('@/pages/Auth'),
    '/dashboard': () => import('@/pages/Dashboard'),
    '/check-email': () => import('@/pages/CheckEmail'),
    '/email-verified': () => import('@/pages/EmailVerified'),
    '/expired-link': () => import('@/pages/ExpiredLink'),
  };

  const importFunc = routeMap[routePath];
  if (importFunc) {
    importFunc().catch((err) => {
      console.warn(`Failed to prefetch route ${routePath}:`, err);
    });
  }
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed estimate
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return 'fast';
  }

  const effectiveType = connection.effectiveType;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  if (effectiveType === '3g') {
    return 'medium';
  }
  return 'fast';
}

/**
 * Schedule work for when the browser is idle
 */
export function scheduleIdleWork(callback: () => void, timeout: number = 1000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Mark performance measurement
 */
export function measurePerformance(name: string, startMark: string, endMark: string): number {
  if (!('performance' in window)) {
    return 0;
  }

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    return measure.duration;
  } catch (e) {
    console.warn(`Performance measurement failed for ${name}:`, e);
    return 0;
  }
}
