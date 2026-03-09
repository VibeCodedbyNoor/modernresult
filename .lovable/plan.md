

## Plan: 6 Feature Additions for ResultPortal.online

### 1. Loading Skeletons
Add skeleton loading states to replace plain "Loading..." text across the app:
- **Landing page**: Skeleton placeholders for the design grid cards while iframes load
- **Dashboard**: Skeleton cards for school data, exams list, credits, and results table
- **Result Portal**: Skeleton for the search form while school data loads
- Use the existing `src/components/ui/skeleton.tsx` component

**Files**: New `src/components/LoadingSkeletons.tsx`, edit `src/pages/Dashboard.tsx`, `src/pages/ResultPortal.tsx`, `src/pages/Index.tsx`

---

### 2. Dark/Light Mode Toggle
- Add `next-themes` ThemeProvider (already installed) wrapping the app in `App.tsx`
- Create a `ThemeToggle` component (Sun/Moon icon button) using `next-themes` `useTheme()`
- Place toggle in the landing navbar and dashboard header
- The existing CSS variables already have `.dark` class definitions in `index.css`, so theme switching will work automatically
- Default to dark mode (current look), allow switching to light

**Files**: New `src/components/ThemeToggle.tsx`, edit `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`

---

### 3. Full SEO Improvements
- Add `public/sitemap.xml` with all public routes (`/`, `/login`, `/signup`, `/demo/*`, `/terms`, `/earn`)
- Update `robots.txt` to reference sitemap
- Add structured data (JSON-LD `EducationalOrganization` schema) to `index.html`
- Add canonical URL meta tags
- Add `rel="canonical"` via a React Helmet-like approach or direct in `index.html`
- Add Open Graph image dimensions and `type` meta tags

**Files**: New `public/sitemap.xml`, edit `public/robots.txt`, edit `index.html`

---

### 4. Subtle Animations (Performance-First)
- Add CSS-only `@keyframes` for fade-in-up on scroll using `IntersectionObserver`
- Create a lightweight `useScrollReveal` hook that adds `.animate-fade-in` class when elements enter viewport
- Apply to: Hero text, HowItWorks cards (staggered), DesignGrid cards, CTA section
- All animations use `transform` and `opacity` only (GPU-accelerated, no layout thrashing)
- Use `will-change: transform` sparingly, `prefers-reduced-motion` media query respected

**Files**: New `src/hooks/useScrollReveal.ts`, edit `src/components/landing/HeroSection.tsx`, `HowItWorks.tsx`, `DesignGrid.tsx`, `CTASection.tsx`, `DoneForYouSection.tsx`, minor `tailwind.config.ts` additions

---

### 5. English/Urdu Language Toggle
- Create `src/contexts/LanguageContext.tsx` with a React context providing `{lang, setLang, t}` where `t(key)` returns the translated string
- Create `src/lib/translations.ts` with `en` and `ur` translation maps for all user-facing strings (landing page, portal search forms, result cards, dashboard labels)
- Add a toggle button (EN | اردو) in the navbar and on result portals
- For Urdu: set `dir="rtl"` on the root container and use `font-family: 'Noto Nastaliq Urdu'` (loaded from Google Fonts)
- Portal pages will show the toggle so students can switch language

**Files**: New `src/contexts/LanguageContext.tsx`, new `src/lib/translations.ts`, new `src/components/LanguageToggle.tsx`, edit `src/pages/Index.tsx`, `src/index.css`, all portal components, `src/App.tsx`

---

### 6. QR Code for Portal Link (Owner Dashboard)
- Add a QR code card in the Dashboard Settings tab, next to the Public URL section
- Use a lightweight QR generation approach: generate QR via a free API (`https://api.qrserver.com/v1/create-qr-code/?data=URL&size=200x200`) or inline SVG library
- QR encodes `https://resultportal.online/results/{slug}`
- Include "Download QR" button (saves as PNG) and "Share" button (Web Share API or copy image)
- Styled card with school name label under QR for print-ready output

**Files**: Edit `src/pages/Dashboard.tsx` (add QR section in Settings tab around line 1525), optionally new `src/components/portal/QRCodeCard.tsx`

---

### Implementation Order
1. Theme toggle (foundational, affects all UI)
2. Language context (foundational, used everywhere)
3. Loading skeletons
4. Scroll animations
5. SEO improvements
6. QR code in dashboard

### Technical Notes
- No new heavy dependencies needed. QR via external API avoids bundle size increase.
- Urdu font loaded async via Google Fonts link tag, won't block rendering.
- All animations use CSS transforms only for 60fps performance.
- `prefers-reduced-motion` will be respected to disable animations for accessibility.

