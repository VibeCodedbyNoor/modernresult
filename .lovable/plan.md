

## Plan: All 3 Issues

### Issue 1: Replace iframes with CSS mockup previews (performance fix)
The `DesignGrid` currently loads 22 iframes, each rendering a full React app. Replace with lightweight CSS-only preview cards using each template's existing color data (`previewBg`, `previewCard`, `previewAccent`, `accentColor`).

Each mockup card will render:
- A header bar with `previewAccent` color and template name
- A fake search form area (two rounded rectangles for inputs, one colored button)
- Bottom bar with template name + accent dot

**File**: `src/components/landing/DesignGrid.tsx` — replace the `<iframe>` block inside `DesignCard` with styled divs using `tmpl.previewBg`, `tmpl.previewCard`, `tmpl.previewAccent`, `tmpl.accentColor`.

### Issue 2: Mobile carousel already uses iframes too — same fix
The `MobileCarousel` component reuses `DesignCard` which has iframes. The same mockup fix applies automatically since `DesignCard` is shared.

### Issue 3: Demo portals — only require class + student name
One-line change in `src/pages/DemoPortal.tsx`: pass `searchFields={['student_name']}` to `PortalComponent` so all demos show only class dropdown + student name input.

**File**: `src/pages/DemoPortal.tsx` — line 79, change `<PortalComponent isDemo={true} />` to `<PortalComponent isDemo={true} searchFields={['student_name']} />`

### Files to modify
1. `src/components/landing/DesignGrid.tsx` — replace iframe with CSS mockup in `DesignCard`
2. `src/pages/DemoPortal.tsx` — add `searchFields={['student_name']}` prop

