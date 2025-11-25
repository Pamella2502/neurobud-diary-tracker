# Performance Best Practices Guide

## Quick Reference for Developers

### 🚀 Code Splitting & Lazy Loading

**When to use:**
- Page-level components
- Heavy third-party libraries
- Features behind feature flags
- Modals and dialogs

**How to use:**
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 🖼️ Image Optimization

**Use OptimizedImage component:**
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src={imageSrc}
  alt="Descriptive alt text"
  width={800}
  height={600}
  loading="lazy" // or "eager" for above-the-fold
/>
```

**Best practices:**
- Always include width/height to prevent CLS
- Use "eager" loading only for above-the-fold images
- Provide descriptive alt text for accessibility

### ⚡ Component Optimization

**Use React.memo for expensive components:**
```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

**Use useCallback for event handlers:**
```tsx
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

**Use useOptimizedCallback for frequent updates:**
```tsx
import { useOptimizedCallback } from '@/hooks/useOptimizedCallback';

const handleScroll = useOptimizedCallback(() => {
  // Scroll handler with RAF batching
}, [dependencies]);
```

### 🎯 Performance Utilities

**Throttle/Debounce with RAF:**
```tsx
import { throttleRAF, debounceRAF } from '@/utils/performance';

const handleResize = throttleRAF(() => {
  // Resize logic - runs at most once per frame
});

const handleSearch = debounceRAF((query) => {
  // Search logic - debounced with RAF
}, 300);
```

**Prefetch routes on hover:**
```tsx
import { prefetchRoute } from '@/utils/performance';

<button
  onMouseEnter={() => prefetchRoute('/dashboard')}
  onClick={() => navigate('/dashboard')}
>
  Go to Dashboard
</button>
```

**Schedule non-urgent work:**
```tsx
import { scheduleIdleWork } from '@/utils/performance';

scheduleIdleWork(() => {
  // Analytics, logging, or other low-priority tasks
});
```

### 📊 Measuring Performance

**Mark important events:**
```tsx
import { measurePerformance } from '@/utils/performance';

performance.mark('data-fetch-start');
await fetchData();
performance.mark('data-fetch-end');

const duration = measurePerformance(
  'data-fetch',
  'data-fetch-start',
  'data-fetch-end'
);
console.log(`Data fetch took ${duration}ms`);
```

### 🎨 CSS Performance

**Use design system tokens:**
```tsx
// ❌ Bad - direct colors
<div className="bg-[#8B5CF6]" />

// ✅ Good - semantic tokens
<div className="bg-primary" />
```

**Optimize animations:**
```css
/* Use transform and opacity for GPU acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

/* Avoid animating layout properties */
/* ❌ Bad */
transition: width 0.3s;

/* ✅ Good */
transition: transform 0.3s;
```

### 📱 Mobile-Specific Optimizations

**Touch targets:**
```tsx
// Ensure minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px]">
  {/* ... */}
</button>
```

**Viewport settings:**
```html
<!-- Already configured in index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### 🌐 Network Optimization

**Preconnect to external domains:**
```html
<!-- Already configured for Supabase -->
<link rel="preconnect" href="https://domain.com" />
<link rel="dns-prefetch" href="https://domain.com" />
```

**Check connection speed:**
```tsx
import { getConnectionSpeed } from '@/utils/performance';

const speed = getConnectionSpeed();
if (speed === 'slow') {
  // Load lower quality images or reduce features
}
```

### 🔄 State Management Performance

**Memoize expensive calculations:**
```tsx
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

**Optimize context providers:**
```tsx
import { useMemo } from 'react';

const value = useMemo(() => ({
  state,
  dispatch
}), [state]);

return (
  <Context.Provider value={value}>
    {children}
  </Context.Provider>
);
```

### 🎭 Accessibility & Performance

**Respect user preferences:**
```tsx
import { prefersReducedMotion } from '@/utils/performance';

const shouldAnimate = !prefersReducedMotion();
```

**Use semantic HTML:**
```tsx
// ✅ Good - semantic and performant
<button onClick={handleClick}>Click me</button>

// ❌ Bad - requires more JS for accessibility
<div onClick={handleClick} role="button" tabIndex={0}>
  Click me
</div>
```

## 🔍 Performance Checklist

Before deploying:

- [ ] All routes are lazy-loaded
- [ ] Images use OptimizedImage component
- [ ] No console.logs in production code
- [ ] Components are memoized where appropriate
- [ ] Event handlers use useCallback
- [ ] Expensive calculations use useMemo
- [ ] CSS uses semantic tokens, not hardcoded colors
- [ ] Animations use transform/opacity
- [ ] Touch targets are minimum 44x44px
- [ ] Lighthouse score is 90+ for all categories

## 🛠️ Tools & Commands

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Run Lighthouse:**
```bash
npx lighthouse https://your-url.com --view
```

**Analyze bundle:**
```bash
npm run build -- --mode analyze
```

## 📚 Additional Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Core Web Vitals](https://web.dev/vitals/)
- [PWA Best Practices](https://web.dev/pwa/)

---

**Remember:** Performance is a feature, not an afterthought!
