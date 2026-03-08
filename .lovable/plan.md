

## Plan: Replace Fake Preview Cards with Live Iframe Previews on Landing Page

### The Problem
The current landing page shows 22 template cards that are all just colored rectangles with a fake mini-form drawn using divs. They all look the same -- just different colors. The old site rendered **actual live iframes** of each portal design scaled down to 25%, so visitors could see the real unique layout of each design before clicking.

### What Changes

**1. Update `src/pages/Index.tsx` -- Design Grid Section**
Replace the current fake mini-preview cards (lines 79-131) with iframe-based preview cards that match the old site's approach:

- Each card becomes `aspect-[4/3]` with an iframe loading `/demo/<template-id>`
- The iframe is scaled to 25% (`w-[400%] h-[400%] scale-[0.25] origin-top-left pointer-events-none`) so the full portal page is visible as a miniature
- Add a gradient overlay at the bottom showing template name and school name
- Add a colored badge in the top-left corner
- On hover, show a "Try Demo" button overlay
- Add a "Want Custom Design?" card at the end linking to WhatsApp

**2. Update `src/lib/resultTemplates.ts`**
Add a `school` field to each template entry (e.g., "Royal Cambridge, Bannu" for luxury-gold) so the landing page can display realistic school names under each preview.

**3. Update `src/pages/ResultPortal.tsx`**
Replace the generic single-layout template renderer with the same portal component mapping used in `DemoPortal.tsx`. Instead of rendering one generic card styled with template colors, it will render the matching standalone portal component (e.g., `OceanPortal`) and pass the real school data as props.

### Technical Details

The iframe approach works because each `/demo/<template-id>` route already renders the full standalone portal component. The landing page simply embeds these as scaled-down previews. The `pointer-events-none` class prevents interaction with the iframe -- clicking the card navigates to the full demo page instead.

For `ResultPortal.tsx`, the same `PORTAL_MAP` from `DemoPortal.tsx` will be reused. Each portal component already accepts `schoolName`, `logoUrl`, `onSearch`, and `demoResult` props, so the real database data just needs to be passed through.

### Implementation Order
1. Add `school` field to `resultTemplates.ts`
2. Rewrite the design grid in `Index.tsx` to use iframe previews
3. Refactor `ResultPortal.tsx` to use standalone portal components with real data

