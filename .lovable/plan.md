

# Add Result Portal Design Templates

## Overview
Add a template selection feature to School Settings where owners pick from visual thumbnails. The selected template ID is stored in the `schools` table and used by `ResultPortal.tsx` to render the appropriate design.

## Database Change
Add a `result_template` column to the `schools` table:
```sql
ALTER TABLE public.schools ADD COLUMN result_template text NOT NULL DEFAULT 'luxury-gold';
```

## Template System Architecture

### 1. Template Registry (`src/lib/resultTemplates.ts`)
A static array of ~8-10 curated templates (starting with a manageable set, expandable later). Each entry:
```ts
{ id: 'luxury-gold', name: 'Luxury Gold', description: 'Royal dark theme with golden accents', thumbnail: '/templates/luxury-gold.png', colors: { bg, card, accent, text, ... }, style: { fontStyle, borderRadius, ... } }
```

Templates to include initially (most distinctive ones):
- **luxury-gold** — Dark navy + golden accents (current default, based on your other project)
- **dark-mode** — Clean dark with blue accent
- **kawaii** — Pastel pink/purple, playful
- **futuristic** — Dark blue, neon purple accents
- **glassmorphism** — Frosted glass cards, gradient bg
- **minimalist** — Clean white, subtle borders
- **islamic** — Green/gold, elegant patterns
- **neon** — Dark with bright neon glow effects

Each template defines: background gradient, card background, accent color override, text colors, border styles, button gradient, font style, and any special decorative elements.

### 2. Dashboard Settings — Template Picker
Add a "Result Design" section in the Settings tab with:
- A grid of visual thumbnail cards (3 columns)
- Each card shows the template name + a colored preview block styled with the template's colors
- Current selection highlighted with a border
- Clicking saves immediately to the database

### 3. ResultPortal.tsx — Template Rendering
Instead of one hardcoded design, `ResultPortal.tsx` will:
1. Read `school.result_template` from the database
2. Look up the template config from the registry
3. Apply the template's colors/styles as CSS variables or inline styles to the existing layout

The layout structure (header, search form, result card, subject table) stays the same — only the visual styling changes per template. This avoids duplicating 8+ full page components.

### Key Implementation Details

**Template config shape:**
```ts
interface ResultTemplate {
  id: string;
  name: string;
  background: string;        // CSS gradient or color
  cardBg: string;            // Card background
  cardBorder: string;        // Card border color
  accentColor: string;       // Primary accent
  textPrimary: string;       // Main text color
  textSecondary: string;     // Muted text
  buttonGradient: string;    // CTA button gradient
  inputBg: string;           // Input background
  tableBg: string;           // Table header bg
  fontClass?: string;        // Optional font class (serif, mono, etc.)
  decorations?: 'sparkles' | 'clouds' | 'geometric' | 'none';
}
```

**Settings UI:** Grid of cards inside the existing Settings tab. Each card is a small preview (colored div with template name). Selected template has a ring/check mark. Saving updates `schools.result_template` via Supabase.

**ResultPortal rendering:** A `getTemplateStyles()` function returns all CSS values based on the template ID, which get applied as inline styles to the existing JSX. Special decorations (sparkles for kawaii, geometric patterns for futuristic) rendered conditionally.

### Files to Create/Edit
1. **Create** `src/lib/resultTemplates.ts` — Template registry with 8 templates
2. **Edit** `src/pages/Dashboard.tsx` — Add template picker grid in Settings tab
3. **Edit** `src/pages/ResultPortal.tsx` — Apply template styles dynamically based on `school.result_template`
4. **Migration** — Add `result_template` column to `schools` table

