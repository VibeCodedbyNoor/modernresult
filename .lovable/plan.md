

## Plan: Global Language Toggle on All Pages

Currently the `LanguageToggle` is only placed in: Index (landing), Dashboard, and ResultPortal. It's missing from: Login, Signup, Terms, EarnWithUs, AdminDashboard, DemoPortal, and NotFound.

### Approach
Instead of adding the toggle to every page individually, create a **global floating language toggle** that renders on every page automatically from `App.tsx`. This is cleaner and ensures it's always available.

### Changes

1. **Create `src/components/GlobalLanguageToggle.tsx`** -- A fixed-position floating toggle (bottom-left or top-right corner) that renders on every page. It will use the existing `LanguageToggle` component wrapped in a fixed container with z-50 positioning.

2. **Add it to `src/App.tsx`** -- Place it inside `LanguageProvider` but outside `Routes`, so it appears globally on all pages.

3. **Remove per-page `LanguageToggle` instances** from:
   - `src/pages/Index.tsx` (navbar toggle)
   - `src/pages/Dashboard.tsx` (header toggle)  
   - `src/pages/ResultPortal.tsx` (fixed toggle)

   This avoids duplicate toggles on pages that already had them.

### Result
A single floating language toggle button visible on every page -- landing, login, signup, dashboard, admin, terms, earn, demo portals, result portals, and 404.

