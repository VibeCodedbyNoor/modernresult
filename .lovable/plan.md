

## Issues Found

### Issue 1: Theme Toggle Doesn't Work on Home Page
The landing page (`Index.tsx`) and all its sub-components (`HeroSection`, `HowItWorks`, `DesignGrid`, etc.) use **hardcoded inline styles** with dark colors (e.g., `style={{ background: 'linear-gradient(180deg, #0a0b14 ...' }}`, `style={{ color: '#f1f0f5' }}`). These inline styles override any CSS variable changes made by the theme toggle. The toggle technically works (switches the class), but nothing visually changes because colors are hardcoded.

**Fix**: Remove the `ThemeToggle` from the landing page navbar entirely. The landing page is designed as a dark-themed marketing page and doesn't need a light mode. The theme toggle is only relevant in the dashboard.

### Issue 2: Admin Account Was Accidentally Deleted
The `admin_delete_school` database function deletes the school, all its data, the profile, AND the user role. If the admin's own school was listed and accidentally deleted, their admin role and profile would be wiped too.

**Fix**: Add a protection check in the `admin_delete_school` function to prevent deleting schools owned by admin users. Also add a UI-level guard in the Admin Dashboard to hide the delete button for the admin's own school.

### Plan

1. **Remove ThemeToggle from landing page** -- Delete the `ThemeToggle` import and usage from `src/pages/Index.tsx` navbar since the landing page is a fixed dark design.

2. **Protect admin from self-deletion (DB)** -- Update `admin_delete_school` function to check if the school owner has an admin role and refuse to delete if so.

3. **Protect admin from self-deletion (UI)** -- In `AdminDashboard.tsx`, hide or disable the delete button for schools owned by the current admin user.

4. **Restore admin account** -- Since the admin account (`noorrehmansmi786@gmail.com`) was deleted, we need to:
   - Re-create the profile entry
   - Re-create the user_roles entry with 'admin' role
   - The auth user should still exist (the function only deletes from public tables, not auth.users)

### Files to edit
- `src/pages/Index.tsx` -- remove ThemeToggle
- `src/pages/AdminDashboard.tsx` -- add UI guard on delete button
- Database migration -- update `admin_delete_school` function with admin protection
- Database insert -- restore admin profile and role if missing

