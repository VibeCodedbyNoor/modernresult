

# Fixes: Pricing Text, Public URL, and Dashboard Countdown

## 1. Landing Page & Dashboard — Remove Exact Price, Add "Save 80%"

**Index.tsx line 189**: Change from "deliver results digitally for just Rs. 9 per student" to "deliver results digitally and save over 80%".

**Dashboard.tsx line 758**: Similar change — remove exact "Rs. 9 per student" text, replace with "Save 80%+ compared to traditional result printing" (already partially there, just remove the "Rs. 9" part).

## 2. Public URL — Use Production Domain

**Dashboard.tsx line 897**: Replace `{window.location.origin}/results/{school.slug}` with a hardcoded production URL: `resultportal.online/results/{school.slug}`.

This ensures users always see the clean branded URL regardless of which environment they're viewing the dashboard from.

## 3. Dashboard Countdown Display

The timer controls and status badges are already implemented (lines 536-598), but they only show when an exam is selected. The issue is likely that:
- The countdown remaining time isn't displayed as a live ticking countdown on the dashboard
- Currently it just shows the target date/time text

I'll add a live countdown display (days/hours/min/sec) in the dashboard's "Result Visibility" card when status is `countdown`, using a `useEffect` with `setInterval` — matching the same pattern used in `ResultPortal.tsx`.

## Files to Edit
1. **`src/pages/Index.tsx`** — Update pricing text to "save 80%+"
2. **`src/pages/Dashboard.tsx`** — Fix public URL to use `resultportal.online`, update pricing text, add live countdown timer display

