

## Plan: Add Contextual Help Text + Change Default Search Field

### Problem
1. Non-technical users need small helper/info text next to each option to understand what it does.
2. Default portal search field should be **only Student Name** (currently defaults to Roll Number + Student Name).

### Changes

#### 1. Database Migration — Change default search_fields
Update the `schools` table column default from `['roll_number', 'student_name']` to `['student_name']`:

```sql
ALTER TABLE public.schools ALTER COLUMN search_fields SET DEFAULT ARRAY['student_name'];
```

This only affects new schools. Existing schools keep their current config.

#### 2. Dashboard UI — Add helper descriptions everywhere (`src/pages/Dashboard.tsx`)

**a) Portal Search Fields section** (lines 1077-1101)
Add a small description under each checkbox:
- **Roll Number**: "Students search by their roll/registration number"
- **Student Name**: "Students search by typing their name"
- **Father Name**: "Students search using their father's name"

Also update the fallback default from `['roll_number', 'student_name']` to `['student_name']` in all places where it appears (lines 1084, 1086).

**b) New Exam dialog** (lines 609-621)
Add a small helper under the exam name input:
- "Give your exam a clear name like 'Annual Exam 2026' or 'Mid-Term 2026'"

**c) Upload Excel dialog** (lines 704-723)
The existing helper text is already good. Keep as-is.

**d) Result Visibility section** (lines 627-687)
- **Set Timer**: add tooltip or description "Schedule when results become visible to students"
- **Stop/Start Showing**: already has status text, no change needed

**e) Template Picker section** (lines 1107-1122)
Add helper under the heading: "This design is what students see when they check results on your portal"

**f) Credits tab** (lines 855-891)
Already has descriptions. No change needed.

**g) Upload Badge** (lines 696-700)
Add tooltip: "First 2 uploads are free, then 10 credits each"

**h) Template change Badge** (lines 1117-1121)
Add tooltip: "First 3 design changes are free, then 5 credits each"

### Files Modified
- 1 database migration (change default)
- `src/pages/Dashboard.tsx` — add helper text/descriptions, update default fallback values

