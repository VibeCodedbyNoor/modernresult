

# Admin Dashboard with Credit Management & Email Notifications

## Overview
Build a dedicated admin dashboard at `/admin` where you (the platform owner) can view all schools, their credits, transactions, and manually update credits. When credits are added, you can send a WhatsApp message with a pre-written motivational notification.

## Database Changes

### 1. Create `user_roles` table (security-definer pattern)
- Create `app_role` enum with values: `admin`, `user`
- Create `user_roles` table with `user_id`, `role` columns
- Create `has_role()` security-definer function
- Enable RLS: only admins can read roles
- Insert your user as admin (you'll need to provide your user ID or email)

### 2. Create `add_credits_admin` security-definer function
- Accepts `p_school_id`, `p_amount`, `p_description`
- Updates `school_credits.balance` += amount
- Inserts a `credit_transactions` record with type `admin_topup`
- Returns the new balance
- Only callable by admins (checked via `has_role`)

## New Pages & Components

### 3. Admin Dashboard page (`src/pages/AdminDashboard.tsx`)
**Analytics cards at top:**
- Total schools registered
- Total credits in circulation
- Total transactions today
- Total active exams

**Schools table:**
- Columns: School Name, Owner Email (from auth — we'll store email in a join or fetch from schools context), Slug, Credit Balance, Created At
- Each row expandable or clickable to show full details
- Fetches from `schools` joined with `school_credits`

**Quick Credit Update section:**
- Search/select school by name
- Input: number of credits to add
- Button: "Add Credits"
- Calls `add_credits_admin` function
- On success, shows a "Send WhatsApp Notification" button

**WhatsApp notification button:**
- Pre-filled message in Urdu/English:
  > "Dear [School Name] Team! 🎉 Great news! [X] credits have been successfully added to your account. Your new balance is [Y] credits. Keep empowering students with instant results! 💪📚 — ResultCheck Team"
- Opens `wa.me` link with the school owner's phone (we'll need to add a `phone` column or use a manual input)

### 4. Route & Auth Guard
- Add `/admin` route in `App.tsx`
- Check `user_roles` table on load — if not admin, redirect to `/dashboard`
- Add admin link in navigation (only visible to admins)

## File Changes Summary
1. **Migration**: `user_roles` table + `has_role` function + `add_credits_admin` function
2. **New file**: `src/pages/AdminDashboard.tsx` — full admin UI
3. **Edit**: `src/App.tsx` — add `/admin` route
4. **Edit**: `src/contexts/AuthContext.tsx` — add `isAdmin` check using `has_role`

## WhatsApp Message Template
Since we don't store phone numbers, the admin will manually enter the school owner's WhatsApp number (or we add an optional `phone` column to `schools`). The message will be:

```
🎉 Assalam o Alaikum!

Dear {schoolName} Team,

Great news! {amount} credits have been successfully added to your ResultCheck account! ✅

📊 Your updated balance: {newBalance} credits

Keep delivering instant, professional results to your students! Every result you publish builds trust with parents and strengthens your school's reputation. 💪📚

Need more credits? Just reach out anytime!

— ResultCheck Team
resultportal.online
```

