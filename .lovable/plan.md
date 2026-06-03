# 5-Step Excel Upload Wizard + Dynamic Search

This is a significant rebuild of the upload flow. I'll keep the existing inline upload as a fallback and add a new wizard component that becomes the primary upload path. Old code stays in place but unused, so reverting is trivial.

## New Files

### `src/components/upload/UploadWizard.tsx`
Main dialog component orchestrating 5 steps. Holds wizard state (file, sheets, sheet-mode, search-mode, field map, subject map, parsed rows, errors).

### `src/components/upload/steps/`
- `Step1Upload.tsx` — file input + first-5-row preview table
- `Step2Structure.tsx` — sheet-mode radio + sheet checkboxes + search-mode radio
- `Step3Mapping.tsx` — required-field dropdowns + subject mapping table (Use As / Total / Pass / display name) + "Use saved template" picker
- `Step4Preview.tsx` — parsed students table with red-highlighted errors and inline edit
- `Step5Confirm.tsx` — summary + import button + progress + "save mapping as template" prompt

### `src/lib/uploadWizard.ts`
Pure helpers: `parseWorkbook`, `applyMapping`, `validateRows`, `chunkInsert`, `buildSampleWorkbook(subjectCount)`.

### `src/lib/sampleTemplate.ts`
Generates a dynamic .xlsx (uses existing `xlsx` package) with N subject columns based on user-input number.

## Files Modified

### `src/pages/Dashboard.tsx`
- Replace the old upload dialog trigger with `<UploadWizard examId={selectedExam} schoolId={school.id} onComplete={...} />`.
- Replace "Download Sample Template" handler with a small prompt asking for subject count, then call `buildSampleWorkbook(n)`.
- Leave existing `handleFileUpload` / `handleConfirmUpload` functions in the file (unused) so the previous behavior can be restored.
- Backup file: `.lovable/backups/Dashboard.before_wizard.tsx`.

### `src/hooks/usePortalSearch.ts` + Portal templates
Currently every portal hardcodes both roll + name fields via `searchFields` prop. Pass `searchMode` ('roll_number' | 'name' | 'both') through `ResultPortal.tsx` → portal components, and adjust the search form to render only required inputs. Class dropdown stays optional in every mode.

### `src/pages/ResultPortal.tsx`
- Fetch the active exam's `search_mode` (already in schema) and pass it to the portal component.
- Adjust the `handleSearch` callback to accept queries with either field.

## Database
Schema already has what's needed (`exams.search_mode`, `exam_subjects`, `column_mappings`). No new migration required. Will use these on save:
- After successful import, optionally insert into `column_mappings` (name, school_id, mapping_config jsonb).
- Insert `exam_subjects` rows from the mapping so portals can render subject metadata.
- Update `exams.search_mode` when wizard finishes.

## Implementation Details

### Step parsing
- Use `XLSX.read` (already a dep). For Option 1 (all-in-one), use first sheet, treat one column as class. For Option 2, list workbook.SheetNames as checkboxes.
- Headers = first row keys after filtering `__EMPTY*`.

### Mapping shape (jsonb saved as template)
```json
{
  "sheet_mode": "single" | "per_sheet",
  "search_mode": "roll_number" | "name" | "both",
  "fields": { "name": "Student", "roll": "Roll", "father": "Father", "class": "Class|null" },
  "subjects": [
    { "column": "Math_Marks", "display": "Mathematics", "total": 100, "pass": 33 }
  ]
}
```

### Validation rules (Step 4)
- Missing student name → red
- Duplicate roll number within same class → red
- `obtained > total` for any subject → red
- Empty rows (all subject + name cells blank) → silently skipped, counted
- Inline edit updates the row; re-validate on blur

### Import (Step 5)
- `chunkInsert` deletes existing `exam_id` results then inserts in batches of 500 with a progress bar
- Inserts unique subjects into `exam_subjects` (idempotent by `exam_id + subject_name`)
- Updates `exams.search_mode`
- Prompt to save mapping as template → insert into `column_mappings`

### Dynamic Sample Template
- Replace any current static sample download. Show a small dialog: "How many subjects?" → number input → on submit generate xlsx with headers `Roll Number, Student Name, Father Name, Class, Subject 1, Subject 2, ...` and 2 example rows.

### Portal Search Mode UI
- `roll_number`: single Roll input
- `name`: single Name input
- `both`: both inputs, either alone is valid
- Class dropdown stays optional everywhere

## Out of Scope (will not change)
- Existing portal templates' visual styling beyond the search form
- Credit/billing flow
- Admin panel
- Backup/restore mechanics beyond a single `.bak` of Dashboard.tsx

After approval I'll implement all of the above in one pass.
