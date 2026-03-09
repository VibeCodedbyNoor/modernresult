

## Mobile Layout Recommendations

Since most of your users will be on mobile, here's my recommendation for each section:

### Video Guide Section
**Current**: 2 cards side-by-side on mobile (via `grid-cols-1` but `max-w-3xl` constrains width).
**Recommendation**: Make each video card take **full width** on mobile with no max-width constraint. Stack them vertically. This gives students maximum tap area and video visibility.

### Design Grid
**Current**: `grid-cols-1` on mobile — each design card is full width but uses `aspect-[4/3]` with a scaled-down iframe preview.
**Recommendation**: Switch to a **horizontal scrollable carousel** on mobile instead of a vertical stack. Reasons:
- A vertical list of 20+ design cards makes the page extremely long on mobile
- A carousel lets users swipe through designs quickly
- Each card stays full-width and prominent
- The page stays compact

### Plan

1. **VideoGuideSection** — Remove `max-w-3xl` constraint on mobile, reduce padding, make cards edge-to-edge with `px-2` on mobile. Keep 2-column grid on `sm:` and up.

2. **DesignGrid** — On mobile (`< sm`), convert to a horizontal swipeable carousel using the existing `embla-carousel-react` dependency (already installed). Each slide takes full width. On `sm:` and up, keep the current grid layout.

3. **Minor touch targets** — Ensure card tap areas and text sizes are comfortable for thumb navigation.

### Files to modify
- `src/components/landing/VideoGuideSection.tsx` — full-width cards on mobile
- `src/components/landing/DesignGrid.tsx` — carousel on mobile, grid on desktop

