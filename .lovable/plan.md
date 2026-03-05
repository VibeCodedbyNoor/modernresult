

# Fix: Add Column Selection Preview Step During Upload

## Problem
Auto-detection of subject columns keeps failing — non-subject columns (Total, %AGE, Position, etc.) slip through filters. Pattern-matching will never cover every edge case across different school formats.

## Solution
Add a **preview step** after file parsing where the school owner manually selects which columns are subjects. This is the most reliable approach — the owner knows their data best.

## Flow
1. Owner uploads Excel/CSV file
2. System parses the file and shows a **preview dialog** with:
   - Auto-detected **Roll Number** column (dropdown to change)
   - Auto-detected **Name** column (dropdown to change)
   - **Checkboxes for all remaining columns** — pre-checked using current smart filtering, but owner can toggle any on/off
   - A preview of 3-5 sample rows so they can see the data
3. Owner confirms → results are processed and uploaded

## Implementation

### `Dashboard.tsx` changes:
- After `XLSX.read()`, instead of immediately processing and inserting, store parsed data in state (`parsedSheets`)
- Show a new **"Column Mapping"** dialog with:
  - Dropdowns for Roll Number and Name columns
  - Checkbox list for all other columns, pre-filtered by the existing `excludePatterns` logic
  - Sample data preview table (first 3 rows)
- On confirm, process the data using the user-selected columns and insert into DB

### New state variables:
- `parsedSheets`: raw parsed data from all sheets
- `columnMappingOpen`: boolean for the mapping dialog
- `selectedRollKey`, `selectedNameKey`: chosen identifier columns
- `selectedSubjects`: `Record<string, boolean>` for toggling subject columns

### UI layout for the mapping dialog:
```text
┌─────────────────────────────────────┐
│ Map Your Columns                    │
│                                     │
│ Roll Number: [dropdown ▾]           │
│ Student Name: [dropdown ▾]          │
│                                     │
│ Select Subject Columns:             │
│ ☑ English   ☑ Math   ☑ Science     │
│ ☐ Total     ☐ %AGE   ☐ Position   │
│                                     │
│ Preview (Sheet: Class 5):           │
│ ┌──────┬────────┬─────┬──────┐     │
│ │ Roll │ Name   │ Eng │ Math │     │
│ │ 101  │ Ahmad  │ 85  │ 92   │     │
│ │ 102  │ Sara   │ 78  │ 88   │     │
│ └──────┴────────┴─────┴──────┘     │
│                                     │
│         [Cancel]  [Upload Results]  │
└─────────────────────────────────────┘
```

This guarantees zero errors regardless of file format — the owner has full control over which columns are subjects.

