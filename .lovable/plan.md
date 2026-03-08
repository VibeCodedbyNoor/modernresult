

# Show Subject Columns in Dashboard Table + Fix Position

## Problems

1. **Dashboard results table** only shows Roll No, Name, Class, Total, Grade — missing individual subject marks
2. **Position on result cards** always shows "—" because position/rank is never stored during upload, and not computed

## Solution

### 1. Expand Dashboard Results Table with Subject Columns

For the currently filtered results (by class tab), extract all unique subject names from the `subjects` JSON. Render them as dynamic table columns between "Name" and "Total".

Each cell shows the obtained marks (e.g., `85`). The table will scroll horizontally if there are many subjects.

### 2. Compute & Store Position During Upload

In `handleConfirmUpload`, after building all rows for a class/sheet, sort students by `total_marks` descending and assign a position (1, 2, 3...). Store it in the `subjects` JSON as a `Position` key (e.g., `{ obtained: 1, total: 0 }`), which the `ResultPortal` already picks up via the `position`/`rank` detection in `processedResult`.

Alternatively, and more cleanly: store position as a simple number value — `subjects.Position = 3` — and the portal's existing `normalized.includes('position')` check will extract it.

## Files to Edit

1. **`src/pages/Dashboard.tsx`**:
   - After `validRows` are built per sheet, group by class, sort by `total_marks` desc, assign position into `subjects.Position`
   - In the results table: compute `subjectKeys` from `filteredResults`, render dynamic `<TableHead>` per subject, render obtained marks in each `<TableCell>`

