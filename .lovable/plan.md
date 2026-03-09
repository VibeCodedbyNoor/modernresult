

## Plan: Full Dashboard Urdu Translation + Tutorial Video System

### Part 1: Full Dashboard Urdu Translation

The dashboard (`src/pages/Dashboard.tsx`, 1934 lines) has all UI text hardcoded in English. The `t()` function from `useLanguage()` is not even imported in the file.

**What needs translating** (all tabs):
- **Top bar**: "ResultCheck", "View Portal", "Sign out"
- **Help banner**: "Need help setting up?", "Send us your school name..."
- **Tab labels**: "Exams & Results", "Credits", "Settings", "Referrals"
- **Exams tab**: "Select an exam", "New Exam", "Create New Exam", "Exam Name", "Upload Excel / CSV", "Publish Exam", "Unpublish", "Result Visibility", "LIVE/COUNTDOWN/STOPPED", "Set Timer", "Stop Showing", "Start Showing", table headers (Roll, Name, Father, Class, Grade, Total, Actions), "Delete" button, etc.
- **Credits tab**: "Available Credits", "Today/This Week/This Month", "Buy Credits", plan labels, "Payment Details", "Transaction History", table headers
- **Settings tab**: "School Settings", "Public URL", "Copy", "School Name", "Accent Color", "Portal Search Fields", field labels/hints, "Choose Your Result Portal Design", template picker labels
- **Referrals tab**: "Total Referrals", "Total Earnings", "Available Balance", "Your Referral Link", "Withdraw", form labels, table headers
- **Dialogs**: Timer dialog, upload confirm, template confirm, column mapping dialog
- **Setup form** (no-school state): "Welcome! Set up your school portal", form labels, slug suggestions

**Approach**:
1. Add ~120 new translation keys to `src/lib/translations.ts` under a `dash.*` prefix
2. Import `useLanguage` in `Dashboard.tsx` and replace all hardcoded strings with `t('dash.key')`
3. Also translate `src/components/portal/QRCodeCard.tsx` (already has some keys but verify)

### Part 2: Tutorial Video System (YouTube Embed)

Four placements for help videos:

1. **Dashboard Help button** (top bar) -- A "Help" icon button that opens a dialog/sheet with an embedded YouTube video + step-by-step checklist
2. **Dashboard Help tab** -- New tab alongside Exams/Credits/Settings/Referrals containing categorized videos (e.g. "How to create exam", "How to upload results", "How to buy credits")
3. **Public Help page** (`/help`) -- Standalone page accessible from landing footer with videos + FAQs
4. **Getting Started card** -- Shown at top of dashboard when school has 0 exams, guiding through first setup with embedded video

**Implementation**:
- Create `src/lib/helpVideos.ts` with video config (YouTube IDs, titles, descriptions) -- you'll fill in real YouTube IDs later
- Create `src/components/dashboard/HelpDialog.tsx` -- modal with video player
- Create `src/components/dashboard/GettingStartedCard.tsx` -- onboarding card
- Add "Help" tab to Dashboard TabsList
- Create `src/pages/Help.tsx` + add route in `App.tsx`
- Add "Help" link in landing page footer
- All text translatable via `t()` keys

### Implementation Order
1. Add all dashboard translation keys to `translations.ts`
2. Wire `t()` into `Dashboard.tsx` (largest change)
3. Build help video components
4. Add Help tab + Getting Started card to dashboard
5. Create public Help page + route

### Files to create/edit
- **Edit**: `src/lib/translations.ts` (add ~120 EN + UR keys)
- **Edit**: `src/pages/Dashboard.tsx` (import useLanguage, replace all strings)
- **Edit**: `src/App.tsx` (add /help route)
- **Edit**: `src/pages/Index.tsx` (add Help link in footer)
- **Create**: `src/lib/helpVideos.ts`
- **Create**: `src/components/dashboard/HelpDialog.tsx`
- **Create**: `src/components/dashboard/GettingStartedCard.tsx`
- **Create**: `src/components/dashboard/HelpTab.tsx`
- **Create**: `src/pages/Help.tsx`

