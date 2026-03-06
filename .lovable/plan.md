

# Redesign Landing Page to Match Reference Site

## What the user wants
The landing page (`Index.tsx`) should be redesigned to match the reference site (resultportal.online / onlineresult.lovable.app):
1. **Dark themed landing page** with a hero section showing "Build beautiful result portals"
2. **"Choose Your Style" grid** showing all 22 design templates as clickable cards
3. **Each card is clickable** — clicking opens a demo view where visitors can enter a name/class and see sample demo data rendered in that template's style
4. **CTA footer** with "Ready to get started?" section

## Technical Approach

### 1. New route: `/demo/:templateId`
A dedicated demo page that renders the `ResultPortal`-like UI using a specific template with hardcoded demo data (no database needed). Shows a sample school name, sample classes, and when searching returns fake student results so visitors can see exactly how the template looks.

### 2. Redesign `src/pages/Index.tsx`
Replace the current generic SaaS landing page with the reference site design:
- **Dark background** (slate-900/950)
- **Hero**: Badge "22 Beautiful Design Templates", heading "Build beautiful result portals", subtitle, two CTAs (Get Your Portal → /signup, View Designs → scroll to grid)
- **Template Grid**: 4 columns on desktop, 2 on mobile. Each card shows:
  - Template's background color as the card fill
  - Template name badge (colored pill matching accent)
  - Template name and sample school name below
  - Clickable → navigates to `/demo/{templateId}`
- **CTA Section**: "Ready to get started?" with signup and contact buttons
- **Footer**: Copyright line

### 3. Create `src/pages/DemoPortal.tsx`
A self-contained demo page that:
- Reads `templateId` from URL params
- Uses `getTemplate()` to get styling
- Shows a fake school header (e.g. "Demo Academy")
- Has class selector with hardcoded classes ("Class 9", "Class 10")
- Has name/roll input — any search returns demo result data with sample subjects
- Renders result card identical to `ResultPortal.tsx` styling
- "Back to Designs" link at top

### 4. Update `src/App.tsx`
Add route: `<Route path="/demo/:templateId" element={<DemoPortal />} />`

### Files to create/edit
1. **Create** `src/pages/DemoPortal.tsx` — Demo portal with fake data, template-styled
2. **Edit** `src/pages/Index.tsx` — Complete redesign to match reference site
3. **Edit** `src/App.tsx` — Add `/demo/:templateId` route

No database changes needed.

