

# Result Timer & Countdown Feature

## Overview
Add a timer system where school owners can schedule when results become visible. A countdown displays on the result portal, and when it ends, results show normally. Owners can also stop/start result display and re-add timers.

## Database Changes

### Add columns to `exams` table
```sql
ALTER TABLE public.exams
  ADD COLUMN display_at timestamptz DEFAULT NULL,
  ADD COLUMN is_stopped boolean NOT NULL DEFAULT false;
```
- `display_at`: When set and in the future, a countdown shows on the portal. When null or past, results display normally.
- `is_stopped`: Manual override to hide results regardless of timer.

## Code Changes

### 1. `Dashboard.tsx` — Timer Controls per Exam
- Add UI controls next to each exam row:
  - **Set Timer**: Date/time picker to set `display_at` (days, hours, minutes from now)
  - **Stop Showing**: Toggle button that sets `is_stopped = true`
  - **Start Showing**: Sets `is_stopped = false` and clears timer
- Update exam via `supabase.from('exams').update(...)` calls

### 2. `ResultPortal.tsx` — Countdown Display
- Fetch `display_at` and `is_stopped` with exam data
- If `is_stopped` is true: show "Results are currently unavailable" message
- If `display_at` is in the future: show a live countdown timer (days/hours/min/sec) with animated styling
- If `display_at` is null or past and `is_stopped` is false: show results normally (existing behavior)
- Countdown uses `setInterval` every second, auto-transitions to results when timer hits zero

### 3. Dashboard — Lightweight Analytics Section
- Add a small analytics card in the credits tab showing:
  - Credits used today / this week / this month (query `credit_transactions` with date filters)
  - Simple bar chart or text stats — no heavy charting library needed, just styled cards

### 4. Dashboard — Credit Purchase History
- In the credits tab, show a table of `credit_transactions`:
  - Date, Type (admin_topup, result_check, bulk_marksheet, signup_bonus), Amount, Description
  - Already fetching transactions — just need to improve the display with date formatting and type badges

## File Summary
1. **Migration**: Add `display_at` and `is_stopped` columns to `exams`
2. **Edit `Dashboard.tsx`**: Add timer controls, stop/start buttons, analytics cards, purchase history table
3. **Edit `ResultPortal.tsx`**: Add countdown logic and "results unavailable" state

