# Accessibility & Offline Support Documentation

## Overview
NeuroBud implements comprehensive accessibility features and offline support to ensure the application is usable by everyone, regardless of ability or network connectivity.

---

## Accessibility Features

### 1. Screen Reader Compatibility

#### ARIA Labels & Roles
- All interactive elements have descriptive `aria-label` attributes
- Navigation elements use proper `role` attributes (`navigation`, `menu`, `menuitem`, `banner`, `main`)
- Form inputs have associated labels using `htmlFor` and `id`
- Status indicators use `aria-live` regions for dynamic updates
- Decorative icons marked with `aria-hidden="true"`

#### Semantic HTML
- Proper use of semantic elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`)
- Heading hierarchy properly structured (h1, h2, h3, etc.)
- Lists use proper `<ul>`, `<ol>`, and `<li>` elements
- Buttons use `<button>` elements, not `<div>` with click handlers

#### Landmarks
- Main navigation: `<nav role="navigation" aria-label="Main navigation sidebar">`
- Main content: `<main id="main-content" role="main">`
- Header: `<header role="banner">`
- Skip to content link for keyboard users

### 2. High Contrast Mode

#### Features
- Toggle in Settings → Accessibility
- Black background (#000000) with white text (#FFFFFF)
- Increased border widths (2px) for better visibility
- Enhanced focus indicators (3px outlines)
- High contrast button states
- Saved to localStorage

#### CSS Implementation
```css
.high-contrast {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 210 100% 60%;
  /* ... other color overrides */
}
```

### 3. Font Size Adjustment

#### Available Sizes
- Small: 14px
- Medium: 16px (default)
- Large: 18px
- Extra Large: 20px

#### Implementation
- Applied via `data-font-size` attribute on root element
- Settings saved to localStorage
- Affects all text elements proportionally
- Available in Settings → Accessibility

### 4. Keyboard Navigation

#### Focus Management
- All interactive elements are keyboard accessible
- Clear focus indicators (2px ring with offset)
- Enhanced focus styles in high contrast mode
- Tab order follows logical flow
- Skip to content link (visible on focus)

#### Keyboard Shortcuts Support
- Tab: Navigate forward
- Shift+Tab: Navigate backward
- Enter/Space: Activate buttons and links
- Escape: Close modals and dropdowns (where applicable)

#### Focus Visible Styles
```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### 5. Reduced Motion Support

#### Features
- Toggle in Settings → Accessibility
- Respects `prefers-reduced-motion` system setting
- Disables/minimizes all animations and transitions
- Auto-detected on first load

#### CSS Implementation
```css
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

### 6. Screen Reader Only Content
- `.sr-only` class for screen reader-only text
- Becomes visible when focused (skip to content link)
- Used for additional context that's visually apparent

---

## Offline Support

### 1. Service Worker & Caching

#### Implementation
- **vite-plugin-pwa** with Workbox
- Auto-update strategy with user notification
- Precaching of static assets
- Runtime caching strategies

#### Caching Strategies

**Static Assets (Precached)**
- JavaScript, CSS, HTML files
- Images, icons (PNG, SVG)
- Fonts (WOFF, WOFF2)

**Google Fonts (CacheFirst)**
- Cached for 365 days
- Fallback to network if cache miss

**Supabase API (NetworkFirst)**
- Network timeout: 10 seconds
- Falls back to 5-minute cache
- Ensures fresh data when online

**Navigation (Offline Fallback)**
- Falls back to index.html when offline
- Client-side routing continues to work

### 2. Offline Indicator

#### Features
- Real-time connection status monitoring
- Visual indicator when offline (orange alert)
- "Back online" notification (green, auto-dismisses)
- Uses `navigator.onLine` and online/offline events

#### Component
```tsx
<OfflineIndicator />
```
- Fixed position (top-right)
- Auto-dismisses online notification after 3 seconds
- Persistent offline notification

### 3. Offline Fallback UI

#### Features
- Graceful error handling for offline state
- Clear messaging about offline status
- Guidance on what users can still do
- Retry functionality

#### Component
```tsx
<OfflineFallback 
  onRetry={() => refetch()}
  message="Custom offline message"
/>
```

### 4. PWA Install Prompt

#### Features
- Custom install prompt on homepage
- Shows on supported browsers (Chrome, Edge, Safari)
- Dismissible (preference saved to localStorage)
- Lists benefits: offline, fast loading, home screen access

#### Trigger Points
- Automatically on first visit (if installable)
- Manual trigger from settings

### 5. Offline Data Management

#### Supported Features When Offline
- View previously loaded data
- Access cached pages and resources
- Navigate between pages (client-side routing)
- View cached images and assets

#### Features Requiring Connection
- Real-time data synchronization
- New data fetching
- Authentication operations
- File uploads

---

## Accessibility Settings Location

**Settings → Accessibility**

### Available Controls
1. **High Contrast Mode**
   - Toggle switch
   - Applies immediately
   - Saved to localStorage

2. **Font Size**
   - 4 size options (Small, Medium, Large, Extra Large)
   - Button group selection
   - Saved to localStorage

3. **Reduce Motion**
   - Toggle switch
   - Respects system preference by default
   - Saved to localStorage

---

## Testing Accessibility

### Screen Reader Testing
1. **NVDA (Windows)**: Press NVDA+Space to start
2. **JAWS (Windows)**: Press Insert to activate
3. **VoiceOver (Mac/iOS)**: Cmd+F5 to activate
4. **TalkBack (Android)**: Settings → Accessibility

### Keyboard Navigation Testing
1. Use Tab key to navigate through interactive elements
2. Verify focus indicators are visible
3. Test Skip to Content link (visible on first Tab)
4. Verify all actions can be completed without mouse

### High Contrast Testing
1. Go to Settings → Accessibility
2. Enable High Contrast Mode
3. Verify text is readable on all backgrounds
4. Check focus indicators are visible

### Reduced Motion Testing
1. **System Level**:
   - Windows: Settings → Ease of Access → Display → Show animations
   - Mac: System Preferences → Accessibility → Display → Reduce motion
   - Test that animations are minimal

2. **App Level**:
   - Go to Settings → Accessibility
   - Enable Reduce Motion
   - Verify animations are disabled

---

## Testing Offline Support

### Service Worker Registration
1. Open DevTools → Application → Service Workers
2. Verify service worker is registered and activated
3. Check "Update on reload" for development

### Offline Mode Testing
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Reload the page
4. Verify app still loads from cache
5. Verify offline indicator appears
6. Test navigation between cached pages

### Cache Inspection
1. Open DevTools → Application → Cache Storage
2. Verify cached assets:
   - workbox-precache: Static assets
   - google-fonts-cache: Google Fonts
   - supabase-cache: API responses

### PWA Installation Testing

**Desktop (Chrome/Edge)**
1. Visit the app in Chrome or Edge
2. Look for install prompt or address bar icon
3. Click to install
4. Verify app opens in standalone window

**iOS (Safari)**
1. Visit app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Verify icon and splash screen

**Android (Chrome)**
1. Visit app in Chrome
2. Tap menu → "Install app" or "Add to Home Screen"
3. Verify icon and splash screen

---

## Browser Support

### Accessibility Features
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### PWA/Offline Features
- ✅ Chrome (63+)
- ✅ Edge (79+)
- ✅ Safari (11.1+)
- ✅ Firefox (44+)
- ✅ Samsung Internet (4+)

---

## Performance Impact

### Accessibility Features
- **High Contrast**: Negligible (CSS-only)
- **Font Size**: Negligible (CSS-only)
- **Reduced Motion**: Negligible (CSS-only)
- **ARIA Labels**: No performance impact

### Offline Features
- **Service Worker**: ~5KB additional JavaScript
- **Cache Storage**: Varies by usage (typically 5-50MB)
- **Precache**: One-time download on first visit
- **Runtime Overhead**: Negligible (<1ms per request)

---

## Future Enhancements

### Planned Accessibility Features
- [ ] Audio descriptions for charts
- [ ] Color blindness modes
- [ ] Text-to-speech for diary entries
- [ ] Dyslexia-friendly font option

### Planned Offline Features
- [ ] Background sync for pending changes
- [ ] Offline form data persistence
- [ ] Conflict resolution for offline edits
- [ ] Offline-first architecture

---

## Compliance

### Standards
- **WCAG 2.1 Level AA**: Target compliance
- **Section 508**: Partially compliant
- **ADA**: Best practices followed

### Areas of Compliance
- ✅ Keyboard accessibility
- ✅ Screen reader compatibility
- ✅ Color contrast (high contrast mode)
- ✅ Resizable text
- ✅ Focus indicators
- ✅ ARIA landmarks and labels

### Known Limitations
- Some complex charts may need enhanced descriptions
- Third-party components (Supabase UI) may have limitations
- PDF exports may need additional accessibility markup

---

## Support & Feedback

For accessibility issues or feedback:
- Report via Support page in the app
- Email accessibility concerns with "A11Y" in subject line
- Describe assistive technology being used

---

## Resources

### Internal
- `/src/contexts/AccessibilityContext.tsx` - Accessibility state management
- `/src/components/AccessibilitySettings.tsx` - Settings UI
- `/src/components/OfflineIndicator.tsx` - Connection status
- `/src/components/OfflineFallback.tsx` - Offline error state
- `/src/components/SkipToContent.tsx` - Skip navigation link
- `/src/index.css` - Accessibility CSS styles

### External
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [WebAIM Resources](https://webaim.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
