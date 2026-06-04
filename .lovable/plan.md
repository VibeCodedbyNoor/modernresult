
# Scope

Five additions on top of the existing ResultPortal. All optional — schools that skip configuration get the current default behavior unchanged.

---

## 1. Per-Exam Calculation Settings

Add `exam_settings jsonb` column on `exams`. Shape:

```json
{
  "percentage": { "mode": "auto" | "column", "column": "Percentage" },
  "grade":      { "mode": "auto" | "custom" | "column",
                  "scale": [{ "name": "A+", "min": 90, "max": 100 }, ...],
                  "column": "Grade" },
  "position":   { "mode": "none" | "auto" | "column", "column": "Position" },
  "result":     { "mode": "auto" | "column",
                  "min_percentage": 33, "column": "Status" }
}
```

UI:
- New `ExamSettingsForm.tsx` rendered inside the existing exam create/edit dialog in `Dashboard.tsx`. Four collapsible sections matching the spec (Percentage, Grade, Position, Pass/Fail). All toggles default to Auto so existing exams keep working.
- Custom grade scale = editable table (add/remove rows, rename, min/max number inputs).
- When any field is set to `"column"`, the Upload Wizard's Step-3 mapping screen surfaces that column as a required mapping (read from `exam_settings`).

Apply settings in a single helper `src/lib/examCalculations.ts` exporting `computeDerived(rawRow, settings) -> { percentage, grade, position, status }`. Used by:
- `ResultPortal.tsx` (`handleSearch` result-card payload)
- Merit list page
- PDF DMC generator

Position auto-calc: ranking happens per (class, exam) by percentage desc with tie handling (1, 1, 3). For perf, computed inside a new SQL function `compute_exam_positions(p_exam_id)` and cached as `position` in JSON results row on import; recomputed when admin clicks "Recalculate Positions" in exam menu.

---

## 2. Merit List Page

Public route `/:slug/merit?exam=<id>` → `src/pages/MeritList.tsx`.

Layout: school header, exam name + year, top-3 podium with medal emojis, full ranked table (Rank | Name | Class | % | Grade | Status), class filter dropdown, name search input.

Wiring:
- Add `<Route path="/:slug/merit" element={<MeritList/>} />` in `App.tsx`.
- "View Merit List" link on the public school portal homepage (added in each result-portal template via existing `PortalBranding` slot — single shared component).
- Exam options menu in Dashboard: new "View Merit List" item that opens the same URL.

Respects `exam_settings` (uses computed percentage/grade/position/status).

---

## 3. PDF Marksheet (DMC) — Pro only

`src/lib/generateDMC.ts` using existing `jspdf` + `jspdf-autotable` (already used for bulk PDFs). Single-student DMC layout per spec: header w/ logo, student info grid, marks table, totals row, footer with optional watermark + signatures.

Customization stored on `schools` as `dmc_settings jsonb`:
```json
{ "watermark": true, "title": "Detailed Marks Certificate",
  "footer_note": "This is a computer generated result",
  "controller_signature_url": null, "principal_signature_url": null }
```

UI:
- New "DMC Settings" tab inside Dashboard customize section (toggle watermark, text fields, optional image uploads to existing storage).
- "Download Marksheet (PDF)" button rendered by `DownloadResultCard` only when `plan === 'pro'` (uses existing `usePlanBySlug`).

---

## 4. Mobile Result Page Polish

Edit `src/components/portal/ResultCard.tsx` (shared by all portal templates):
- Below `md`: subject marks render as stacked cards (subject name, "obtained/total", grade chip, pass/fail badge) instead of `<table>`.
- Student info: `grid-cols-2` on mobile, single row on desktop.
- Add `rounded-2xl shadow-lg` to result card.

Edit `src/components/portal/ResultActions.tsx`:
- On mobile, "Download DMC" + "Share on WhatsApp" become a sticky bottom bar (`fixed inset-x-0 bottom-0` z-40, full-width split buttons). WhatsApp button hidden on desktop.
- Bump `ResultPortal.tsx` mobile bottom padding from `pb-20` to `pb-32` so the sticky bar doesn't cover the AdBanner.

Audit at 320 / 375 / 414 — `overflow-x-hidden` on portal root.

---

## 5. Result-Check Counter (Super Admin)

Add `result_check_count int default 0` on `schools`. Increment inside `fuzzy_search_results` (turn into a wrapping plpgsql function that calls the existing SQL function then `UPDATE schools SET result_check_count = result_check_count + 1 WHERE id = ...` when a row is found).

Display in `AdminDashboard.tsx` school list as a small "👁 N checks" badge next to each school, and on the school detail panel as a stat tile.

---

## Technical Details

**Migration (single file):**
- `ALTER TABLE exams ADD COLUMN exam_settings jsonb DEFAULT '{}'::jsonb;`
- `ALTER TABLE schools ADD COLUMN dmc_settings jsonb DEFAULT '{}'::jsonb;`
- `ALTER TABLE schools ADD COLUMN result_check_count int NOT NULL DEFAULT 0;`
- Replace `fuzzy_search_results` to also bump `result_check_count` (security definer).
- New SQL helper `recalc_exam_positions(p_exam_id uuid)` updating each result row's JSON with a `position` field.

**New files:**
- `src/components/dashboard/ExamSettingsForm.tsx`
- `src/lib/examCalculations.ts`
- `src/lib/generateDMC.ts`
- `src/pages/MeritList.tsx`
- `src/components/dashboard/DMCSettingsForm.tsx`

**Modified files:**
- `src/App.tsx` — merit route
- `src/pages/Dashboard.tsx` — embed `ExamSettingsForm` in exam dialog; add "View Merit List" + "Recalculate Positions" to exam menu; add DMC settings tab
- `src/components/upload/UploadWizard.tsx` — surface column mappings for fields set to `"column"` mode
- `src/pages/ResultPortal.tsx` — apply `computeDerived`
- `src/components/portal/ResultCard.tsx` — mobile card layout
- `src/components/portal/ResultActions.tsx` — sticky mobile action bar + Pro-gated DMC button
- `src/pages/AdminDashboard.tsx` — result-check counter display

**Out of scope:** No changes to credit/billing, no new portal templates, no auth changes. Existing exams without `exam_settings` continue to behave exactly as today (defaults are equivalent to current logic).

After approval I'll implement everything in one pass, starting with the migration.
