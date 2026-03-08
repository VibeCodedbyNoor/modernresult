

## Plan: Live Iframe Previews in Dashboard Template Picker + Wire ResultPortal

### Changes

**1. `src/pages/Dashboard.tsx` (lines 1034-1052)**
Replace the fake color-placeholder preview with a live iframe, same as the landing page:

```tsx
<div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
  <iframe
    src={`/demo/${template.id}`}
    className="w-[400%] h-[400%] scale-[0.25] origin-top-left pointer-events-none"
    loading="lazy"
    tabIndex={-1}
  />
</div>
```

Everything else (name, description, ACTIVE badge, selected ring, click handler) stays the same.

**2. `src/pages/ResultPortal.tsx`** — already updated in prior work to use `PORTAL_MAP` with standalone components. The selected template flows from the database through to the portal component, so students see the exact design the school owner picked.

### Summary
One file changed, ~18 lines replaced. The dashboard picker will show real portal previews, and students already see the matching design via `ResultPortal`.

