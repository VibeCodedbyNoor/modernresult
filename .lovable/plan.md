

# Fix Column Mapping Dialog Layout

## Problem
The "Map Your Columns" dialog requires both horizontal and vertical scrolling, making it look unprofessional on smaller screens. The content overflows the dialog width.

## Solution

Make the dialog responsive and eliminate horizontal scrolling:

### Changes to `src/pages/Dashboard.tsx` (lines 1115-1258)

1. **Dialog width**: Change `max-w-lg` to `w-[95vw] max-w-md sm:max-w-lg` so it fits mobile screens without horizontal overflow.

2. **Sheet tabs**: Add `overflow-x-auto` with hidden scrollbar styling so many class tabs scroll horizontally within the dialog instead of wrapping and pushing content.

3. **Roll/Name selectors**: Keep the 2-column grid but ensure `min-w-0` on select triggers so they truncate long header names instead of overflowing.

4. **Subject list**: Each subject row already looks good. Keep as-is with the total marks input at `w-16`.

5. **Preview table**: Replace the full `<Table>` with a simpler, more compact card-based preview showing just 1 student sample. Display as a vertical key-value list instead of a horizontal table:
   ```
   Preview (1st)
   ┌─────────────────────────┐
   │ S.No: 1                 │
   │ Name: Fazli Ullah       │
   │ ENGLISH: 45 / 100       │
   │ maths: 95 / 100         │
   │ URDU: 65 / 100          │
   └─────────────────────────┘
   ```
   This eliminates horizontal scrolling entirely since each field stacks vertically.

6. **Footer buttons**: Make them full-width on mobile with `flex-col sm:flex-row` layout.

This approach removes all horizontal scrolling while keeping the dialog compact and professional.

