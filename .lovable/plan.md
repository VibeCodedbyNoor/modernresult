## Goal

Drop the signature draw/upload feature entirely and replace it with **5 selectable PDF marksheet (DMC) design templates** that the school owner picks in the dashboard. The chosen template is used when students download their marksheet from the portal.

## 1. Remove signature feature

- `src/components/dashboard/DMCSettingsForm.tsx` — delete the entire signature section: draw modal, upload inputs, `SignatureCanvas` ref, upload-signature handler, related state (`activeDrawType`, `uploadingController`, `uploadingPrincipal`), and the `Pencil`/`Trash2`/`X` icons used only for signatures.
- `src/lib/generateDMC.ts` — remove `controller_signature_url` and `principal_signature_url` from `DMCSettings` and remove the entire "Signatures" block (image rendering, signature lines, "Controller/Principal Signature" labels).
- Remove the `react-signature-canvas` dependency from `package.json`.
- Database: set `dmc_settings` to drop both signature URL keys for all schools (migration: a JSONB update stripping those keys). The `school-assets` storage bucket and public-read policy stay in place (still used for logos).

## 2. Add 5 DMC templates

Create `src/lib/dmcTemplates.ts` exporting a registry of 5 template renderers. Each renderer takes `(doc, data, settings)` and produces a fully styled jsPDF page. Distinct visual identities:

| ID | Name | Visual character |
|---|---|---|
| `classic` | Classic | Traditional bordered certificate, serif header, double-rule lines, formal layout (current style refined) |
| `modern` | Modern | Clean minimal, sans-serif, generous whitespace, single accent bar at top using school accent color |
| `elegant` | Elegant | Decorative corners/ornaments, italic serif title, soft gold accents, centered composition |
| `compact` | Compact | Dense single-page layout, smaller fonts, side-by-side info + marks, ideal for many subjects |
| `premium` | Premium | Bold colored header band (school accent), white-on-color title, prominent grade badge, watermark mandatory |

`generateDMC()` becomes a thin dispatcher that calls the renderer based on `settings.template` (default `classic`). Shared helpers (`urlToDataUrl`, autoTable wrapper, totals row) live in the same file.

## 3. Dashboard template picker

Update `src/components/dashboard/DMCSettingsForm.tsx`:
- Add a new "Marksheet Template" section at the top of the card.
- Render 5 selectable cards (2-3 columns responsive) each showing a small CSS preview (no iframes, per project memory) and template name.
- Selected card gets primary ring/border (matches existing result-template picker styling).
- Selection saves to `schools.dmc_settings.template` via the existing save flow.
- Keep existing settings: title, address/phone/email, footer note, watermark toggle.

CSS mini-previews are simple styled divs that hint at each layout (header bar, border, ornament corners, etc.) — kept lightweight per existing convention.

## 4. Wiring

- `src/pages/ResultPortal.tsx` — no change needed; it already passes `(school as any).dmc_settings` to `generateDMC`, which now respects `template`.
- `src/integrations/supabase/types.ts` is auto-regenerated; the `dmc_settings` JSONB shape is unconstrained at the DB level, so no schema change needed beyond the cleanup migration.

## Technical notes

```text
src/lib/
  generateDMC.ts        ← dispatcher + shared helpers + DMCSettings type
  dmcTemplates/
    classic.ts
    modern.ts
    elegant.ts
    compact.ts
    premium.ts
    index.ts            ← TEMPLATE_REGISTRY + previews metadata
src/components/dashboard/
  DMCSettingsForm.tsx   ← template picker + cleaned settings (no signatures)
  DMCTemplatePreview.tsx ← small CSS preview component (5 variants)
```

Migration (single SQL): `UPDATE schools SET dmc_settings = (dmc_settings - 'controller_signature_url' - 'principal_signature_url') WHERE dmc_settings ? 'controller_signature_url' OR dmc_settings ? 'principal_signature_url';`

## Out of scope

- No changes to credit system, portals, or exam logic.
- Signature storage objects already uploaded remain in the bucket (orphaned but harmless); not deleting them avoids risk of touching shared storage.
