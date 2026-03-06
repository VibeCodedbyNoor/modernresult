

# Redesign Template Picker to Match onlineresult.lovable.app

## What the user wants

1. The **Dashboard Settings template picker** should show designs exactly like the showcase at onlineresult.lovable.app — full visual preview cards in a grid, with design name, sample school name, and a styled mini-portal preview (not just abstract color blocks).
2. Expand from 8 templates to **22 templates** matching the reference site: Luxury Gold, Kawaii, Futuristic, Dark Mode, Material Design, Gradient Modern, Neumorphism, Neon, CyberPunk, Glassmorphism, Retro, Minimalist, Ocean, Nature, Islamic, Sunset, Corporate, Pastel, Galaxy, Royal Purple, Monochrome, Elegant.
3. The settings page should remain exactly as-is (school name, URL, accent color) — only the template picker section gets upgraded.
4. Make it **non-technical user friendly** — clear labels, visual previews that show exactly what the portal will look like.

## Technical approach

### 1. Expand `src/lib/resultTemplates.ts`
- Add 14 new template entries (currently 8, target 22)
- Each new template: Material Design, Gradient Modern, Neumorphism, CyberPunk, Retro, Ocean, Nature, Sunset, Corporate, Pastel, Galaxy, Royal Purple, Monochrome, Elegant
- Color values will be extracted/matched from the reference site screenshots

### 2. Redesign template picker in `src/pages/Dashboard.tsx`
- Replace the current abstract thumbnail cards with **rich preview cards** that render a mini version of the actual portal UI (school name, form fields, button) using each template's actual colors
- Each card shows: template name badge, sample school name, a styled mini search form preview
- Grid layout: 2 columns on mobile, 3 on tablet, 4 on desktop
- Selected template gets a prominent ring + checkmark
- Add a heading: "Choose Your Style" with subtitle explaining it

### 3. `src/pages/ResultPortal.tsx`
- Ensure all 22 templates render correctly (the existing dynamic styling approach handles this — just need to make sure the template lookup works for all new IDs)

### Files to edit
1. **`src/lib/resultTemplates.ts`** — Add 14 new templates (total 22)
2. **`src/pages/Dashboard.tsx`** — Redesign the template picker grid with rich mini-portal preview cards

No database changes needed — `result_template` is already a text column that accepts any template ID string.

