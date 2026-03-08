

# Fix Upload Logic & Dynamic Class Dropdown

## What's Needed

1. **Delete old results on re-upload**: Before inserting new results for an exam, delete all existing results for that exam so data stays clean on updates.

2. **Multi-sheet Excel already works** — each sheet name becomes `class_name`. No change needed there. The sheet names can be anything: "1st", "Prep", "YT Batch 1", "MBBS 2025", etc.

3. **Result portal class dropdown already dynamic** — `ResultPortal.tsx` (line 124) already queries distinct `class_name` values from the results table for the selected exam. So whatever sheet names are uploaded will appear in the dropdown automatically.

## Changes

### `Dashboard.tsx` — `handleConfirmUpload()` (around line 235)

Add a delete step before inserting new rows:

```typescript
// Before inserting, delete all existing results for this exam
await supabase.from('results').delete().eq('exam_id', selectedExam);
```

This goes right before the insert call (line 288). This ensures re-uploading replaces old data entirely.

Update the success toast to mention "replaced" when old data existed.

### No other changes needed

- Multi-sheet support already exists (line 195-201 loops through all sheets)
- Sheet names already become class names (line 276: `class_name: sheetName`)
- ResultPortal already loads classes dynamically from the data (line 124)
- Classes work for any naming: school classes, batches, years, etc.

## Summary

The only actual code change is adding one line to delete existing results before re-upload. Everything else the user asked about already works.

