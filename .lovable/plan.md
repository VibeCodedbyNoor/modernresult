

## Plan: Fix Subject Display + Remove Branding from All Portals

### Root Cause — Subjects Not Showing

The database stores subjects as a **nested object**:
```json
{"ENGLISH": {"obtained": 56, "total": 100}, "maths": {"obtained": 80, "total": 100}, "Position": 15}
```

But `ResultPortal.tsx` line 107 does `Array.isArray(row.subjects)` which returns `false`, so `subjects` becomes `[]` — an empty array. All 22 portals then render zero subject rows; only the TOTAL row shows.

### Fix 1: Transform subjects in `ResultPortal.tsx` (lines 106-120)

Convert the flat object format to the array format all portals expect:

```typescript
import { CLASS_SUBJECTS } from '@/lib/classSubjects';

// After getting row:
const rawSubjects = row.subjects as any;
let subjects: any[] = [];

if (Array.isArray(rawSubjects)) {
  subjects = rawSubjects;
} else if (typeof rawSubjects === 'object' && rawSubjects !== null) {
  const classConfig = CLASS_SUBJECTS[row.class_name] || [];
  subjects = Object.entries(rawSubjects)
    .filter(([key]) => key !== 'Position') // Skip non-subject keys
    .map(([name, value]) => {
      const val = value as any;
      const config = classConfig.find(c => c.subject.toLowerCase() === name.toLowerCase());
      return {
        subject: config?.subject || name,
        obtained_marks: typeof val === 'object' ? Number(val.obtained) || 0 : Number(val) || 0,
        total_marks: typeof val === 'object' ? Number(val.total) || 0 : config?.total_marks || 100,
      };
    });
}
```

Also extract `Position` from the subjects object if present, to show in the result card.

### Fix 2: Remove PortalBranding from all 22 portals

Delete the `<PortalBranding>` component usage from all 22 portal files and remove the import. This removes both the "Powered by RESULTPORTAL" badge and the "Get Portal" button.

### Files Modified
- `src/pages/ResultPortal.tsx` — transform subjects object to array + extract position
- All 22 files in `src/pages/portals/` — remove `PortalBranding` import and usage

