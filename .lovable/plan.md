

## Plan: Replace Current Dynamic Template System with 22 Unique Standalone Portal Designs

### What Changes
Right now, all 22 designs in your project look the same -- same layout, same card shape, same form -- only the colors change. The old website had 22 completely different page designs (each with unique layouts, animations, visual effects). This plan ports all of them from your old GitHub repo into this project, so:

1. **Demo pages** at `/demo/<template-id>` will show each design exactly as it looked on your old site
2. **School owner portals** at `/results/:slug` will render the selected design with real data from the database
3. **Dashboard template picker** stays the same -- school owners click a design to apply it

### What Gets Created (~35 files)

**Shared utilities (2 files):**
- `src/lib/classSubjects.ts` -- subject/marks config per class (used for demos)
- `src/lib/demoResults.ts` -- generates sample student data for demo previews

**Shared components (5 files):**
- `src/components/portal/BackButton.tsx` -- themed back navigation
- `src/components/portal/PortalBranding.tsx` -- branded footer with WhatsApp CTA
- `src/components/portal/ResultActions.tsx` -- download/share buttons
- `src/components/portal/ResultCard.tsx` -- Neon-specific result display with download
- `src/components/portal/DownloadResultCard.tsx` -- off-screen card for image generation

**Neon UI components (3 files):**
- `src/components/ui/neon-input.tsx`
- `src/components/ui/neon-select.tsx`
- `src/components/ui/neon-button.tsx`

**22 Demo portal pages** (under `src/pages/portals/`):
Corporate, CyberPunk, DarkMode, Elegant, Futuristic, Galaxy, Glassmorphism, GradientModern, Islamic, Kawaii, LuxuryGold, MaterialDesign, Minimalist, Monochrome, Nature, Neon, Neumorphism, Ocean, Pastel, Retro, RoyalPurple, Sunset

Each page is copied exactly from your old repo, adapted to work with this project's imports.

### What Gets Modified

- **`src/pages/DemoPortal.tsx`** -- Instead of rendering one generic layout, it maps `templateId` to the correct standalone portal component
- **`src/pages/ResultPortal.tsx`** -- Same approach: maps the school's `result_template` to the matching standalone portal, passing real database data instead of demo data
- **`src/App.tsx`** -- Routes stay the same (`/demo/:templateId` and `/results/:slug`), the portal pages just render differently now
- **`src/lib/resultTemplates.ts`** -- Keep the template list (used by dashboard picker) but add a mapping from template ID to portal component

### How It Works

**For demos:** Visitor clicks a design in the picker → goes to `/demo/neon` → `DemoPortal.tsx` loads the `NeonPortal` component → uses `generateDemoResult()` for sample data.

**For school owners:** Student visits `/results/my-school` → `ResultPortal.tsx` loads school data from database → renders the matching portal component (e.g., `NeonPortal`) with real student data from the database.

**For the dashboard:** The template picker UI stays exactly the same. School owners click a design thumbnail to apply it. The visual previews in the picker remain unchanged.

### Key Adaptation
The old portals were hardcoded for one school ("Al-Huda Model School") with demo data only. Each portal will be refactored to accept props (`schoolName`, `logoUrl`, `examName`, `onSearch`, `result`, etc.) so the same component works for both demo and real school usage.

### Implementation Order
1. Create utility files and shared components
2. Create neon UI components
3. Create portal pages in batches (~5 at a time)
4. Update DemoPortal and ResultPortal to use the new components
5. Test the flow end-to-end

