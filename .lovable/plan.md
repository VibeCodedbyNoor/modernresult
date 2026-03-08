

## Plan: Father Name Support + Configurable Search Fields

### Two Features

**Feature 1: Father Name in Result Card**
- The Excel upload already filters out "father" columns via `NON_SUBJECT_PATTERNS` (line 56 in Dashboard.tsx). We need to instead **capture** the father name column during upload and store it in the `subjects` JSON (or a dedicated field).
- On the portal side, if `father_name` is present in the result, show it below the student name. If absent, hide it completely — no empty row or label.

**Feature 2: Configurable Search Fields per School**
- School owners pick which field(s) students use to search: Roll Number, Student Name, Father Name (multi-select).
- The portal form dynamically shows only the selected search fields.
- The DB search function adapts accordingly.

---

### Database Changes

1. **Add `search_fields` column to `schools` table** — a `text[]` array defaulting to `{'roll_number', 'student_name'}`:
```sql
ALTER TABLE public.schools 
ADD COLUMN search_fields text[] NOT NULL DEFAULT ARRAY['roll_number', 'student_name'];
```

2. **Add `father_name` column to `results` table** — nullable text to store father name when provided:
```sql
ALTER TABLE public.results ADD COLUMN father_name text DEFAULT '';
```

3. **Update `fuzzy_search_results` function** to accept and use `p_father_name` (optional), and also allow search by roll number alone or father name alone:
```sql
CREATE OR REPLACE FUNCTION public.fuzzy_search_results(
  p_exam_id uuid, p_class_name text, p_query text, 
  p_roll_number text DEFAULT '', p_father_name text DEFAULT ''
)
RETURNS SETOF results ...
-- Match by: roll_number if provided, student_name if provided, father_name if provided
```

### Dashboard Changes (`src/pages/Dashboard.tsx`)

1. **Upload logic (lines 230-247)**: Stop filtering out "father" from column headers. Add a new mapping option: `fatherKey` alongside `rollKey` and `nameKey`. During upload, store the father name value in `results.father_name`.

2. **Settings tab**: Add a "Search Fields" multi-select section below the template picker. Options: Roll Number, Student Name, Father Name. Saves to `schools.search_fields`.

### Portal Changes

1. **`ResultPortal.tsx`**: 
   - Fetch `search_fields` from the school record.
   - Pass `searchFields` array + the search handler to the portal component.
   - Update `handleSearch` to accept an object `{rollNumber, studentName, fatherName}` instead of just two strings, and call the updated RPC with appropriate params.
   - Pass `father_name` in the result object returned to portals.

2. **All 22 portal components**: 
   - Update `PortalProps` interface to include `searchFields?: string[]`.
   - Dynamically render search form fields based on `searchFields` (show roll number input only if `searchFields` includes `'roll_number'`, etc.).
   - Update `onSearch` signature to accept an object instead of two strings.
   - In the result card, show "Father: {name}" below the student name only if `result.father_name` exists and is non-empty.

### Files Modified
- 2 database migrations (add columns + update function)
- `src/pages/Dashboard.tsx` — upload mapping for father name + search fields settings UI
- `src/pages/ResultPortal.tsx` — pass search fields, update search handler
- All 22 files in `src/pages/portals/` — dynamic search form + father name in result card

