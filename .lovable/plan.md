

# Per-Class Subject Mapping with Total Marks Input

## Problem
Currently, when uploading a multi-sheet Excel file (each sheet = a class), all sheets share one global set of headers and one subject selection. But different classes often have different subjects (e.g., Class 9 has "Chemistry" but Class 5 does not). Users also cannot specify total marks per subject (defaults to 100).

## Solution

### 1. Per-Sheet (Per-Class) Column Mapping

Replace the single global mapping with a **tabbed interface** — one tab per sheet/class. Each tab shows:
- **Roll Number** column selector (auto-detected per sheet)
- **Student Name** column selector (auto-detected per sheet)
- **Subject checkboxes** showing only that sheet's actual headers
- **Total Marks** input next to each subject checkbox (default: 100)

**State change:**
```
// Current (global)
allHeaders: string[]
selectedRollKey: string
selectedNameKey: string
selectedSubjects: Record<string, boolean>

// New (per-sheet)
sheetMappings: Record<string, {
  headers: string[]
  rollKey: string
  nameKey: string
  subjects: Record<string, { selected: boolean; totalMarks: number }>
}>
```

### 2. Filter `__EMPTY` Columns
When extracting headers from each sheet, filter out any header matching `__EMPTY`, empty string, or whitespace-only. This prevents junk columns from appearing.

### 3. Store Subjects as Objects
Change `handleConfirmUpload` to store subjects as `{ obtained: marks, total: userSetTotal }` objects instead of plain numbers. The `ResultPortal.tsx` already handles this format via `parseSubjectValue`.

### 4. Compact Dialog Layout
- Use `max-w-lg` instead of `max-w-2xl`
- Tabs for each class sheet (sheet name as tab label)
- Subject list: each row = checkbox + subject name + small "Total" number input
- Preview table reduced to 2 rows

### 5. Class-wise Tabs in Exam Results
In the results section of Dashboard, replace the class dropdown with horizontal tab pills showing each class. Each tab filters results to that class. An "All" tab shows everything.

## Files to Edit
1. **`src/pages/Dashboard.tsx`** — Per-sheet mapping state, tabbed column mapping dialog, total marks inputs, `__EMPTY` filtering, subject-as-object storage, class tabs in results view

