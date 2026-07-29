## Problem

The public portal calls `get_active_exam_by_slug`, which returns only the newest published exam (`ORDER BY created_at DESC LIMIT 1`). When a school publishes several exams at once, students can only ever reach the latest one — every other published exam is invisible, and searches for those students return "result not found".

## Solution

Let the portal load **all** currently-active published exams and give students a dropdown to pick one. Search stays scoped to the selected exam only.

## What changes

**1. Database — new function `get_published_exams_by_slug(p_slug text)`**
- Security definer, same column shape as the existing single-exam function, but returns every row for the school where `is_published = true`, ordered newest first.
- Keeps `get_active_exam_by_slug` intact so nothing else breaks.

**2. Result portal (`src/pages/ResultPortal.tsx`)**
- Fetch the full list of published exams; keep `activeExam` as the *selected* exam (defaults to the newest).
- Compute exam state (countdown / stopped / active) per selected exam, exactly as today.
- When the student changes exam: reload that exam's class list, clear the previous result, and re-evaluate the status banner.
- Search, calculation settings, and DMC generation all continue to use the selected exam only — no cross-exam matching.

**3. Exam selector UI**
- A compact, styled `Select` rendered above the portal template (only when 2+ exams are published), labelled e.g. "Choose Exam".
- Each option shows the exam name; exams that are stopped or still counting down are labelled inline (e.g. "Term 2 — Coming soon") so students understand why the portal is locked after selecting them.
- With a single published exam nothing is shown — current experience unchanged.
- Selector sits outside the "disabled" overlay wrapper so a student can switch away from a paused/countdown exam.

**4. Owner-side clarity (`src/pages/Dashboard.tsx`)**
- Small helper note near the publish toggle: publishing more than one exam shows a chooser to students; unpublish or stop the ones that shouldn't be visible.

## Notes

- No changes to results, RLS, or the upload wizard.
- Demo portals and the 22 template components are untouched — the selector lives in `ResultPortal.tsx`.
