## Overview

Add a 5-step dynamic Excel import wizard, a two-tier pricing system (Free/Pro), conditional ad placement on free portals, homepage trust banner, billing page, and admin plan toggle. Remove existing paid-credit payment integrations in favor of manual WhatsApp upgrades.

The current app is credit-based (PKR 9/credit, EasyPaisa). This change replaces monetization entirely with Free vs Pro ($20/month, manually activated). Confirm before I proceed since this is a major business-model shift.

---

## 1. Database changes (one migration)

- `schools.plan` — text, default `'free'`, check in (`'free'`,`'pro'`)
- `exams.search_mode` — text, default `'roll_number'`, in (`'roll_number'`,`'name'`,`'both'`)
- `exams.password` — text nullable (Pro: password-protect exams)
- New table `column_mappings` (id, school_id, name, mapping_config jsonb, created_at) with RLS so owners manage their own + GRANTs
- New table `exam_subjects` (exam_id, subject_name, total_marks, pass_marks) so per-exam totals/pass marks are stored from the wizard
- Helper RPC `set_school_plan(p_school_id, p_plan)` — admin-only via `has_role`

Keep all existing credit tables intact (no destructive drops) — just stop using them in the UI.

---

## 2. Excel Import Wizard (`src/components/dashboard/import/`)

New 5-step wizard component replacing the current upload flow on Dashboard:

1. **Upload** — parse with SheetJS (`xlsx` lib, already in deps), show first 5 rows preview, list all sheet names
2. **Configure** — radio: single-sheet-with-class-col vs sheet-per-class (+ sheet checkboxes); radio for search_mode
3. **Map columns** — required-field dropdowns + subject mapping table with per-subject total/pass marks + display-name rename; offer saved templates from `column_mappings`
4. **Preview & validate** — red-highlight missing names / duplicate rolls / marks > total / skipped empties; inline editing
5. **Confirm & import** — chunked inserts of 500 into `results` (+ create `exam_subjects`); progress bar; prompt "Save as template?"

Dynamic sample template: prompt for subject count, generate `.xlsx` on the fly.

Update `ResultPortal.tsx` search UI to read `exam.search_mode` and render only relevant inputs (class dropdown stays optional).

---

## 3. Pricing / billing

- Remove EasyPaisa/JazzCash/Stripe/Lemon Squeezy UI from Dashboard, AI chat agent prompt, Terms, Earn, Help pages
- New `/dashboard/billing` page: plan chip, usage stats, WhatsApp upgrade card (`https://wa.me/923478312432`)
- Dashboard sidebar: plan chip ([Free] / [Pro ⭐])
- AdminDashboard school detail: Free↔Pro toggle calling `set_school_plan` with confirm dialog
- AuthContext (or new `usePlan` hook) exposes current school plan

---

## 4. Ads — free plan only

- `src/components/AdBanner.tsx` — accepts `placementId`, reads plan from context, returns `null` if Pro
- Two placements above/below result card in every portal template via `ResultPortal.tsx` wrapper (single edit, not 22 files)
- Social-bar script injected once via `useEffect` only when school is free
- 300ms delay after result render before injecting ad scripts
- Never injected on dashboard or Pro portals

---

## 5. Homepage trust banner

Add "Free Forever — No Credit Card Required" banner between `DoneForYouSection` and `CTASection` in `Index.tsx`. "See Pro Features" scrolls to a minimal 2-column Free vs Pro comparison (shown to logged-out users) or routes to `/dashboard/billing` when logged in.

---

## Out of scope (confirm if you want these too)

- Branded PDF DMC, merit list page, countdown gating by plan — listed as Pro perks but not built in this pass unless you say so
- Migrating existing schools to set `plan='free'` explicitly (default handles it)
- Removing credit-related dashboard tabs entirely vs hiding them

---

## Technical notes

- SheetJS (`xlsx`) — install if missing
- Chunked inserts use `supabase.from('results').insert(chunk)` in a loop with progress state
- Ad scripts injected via dynamically created `<script>` tags appended to `document.body`, cleaned up on unmount
- Plan check is a single supabase query cached in React Query, keyed on school id

---

**Confirm to proceed**, or tell me which parts to skip / do first. This is ~15+ new files and edits to ~10 existing files; I'd suggest landing it in 2 PRs (wizard first, then pricing+ads) but can do it all at once if you prefer.