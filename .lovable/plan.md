

## Plan: Terms & Rules Page + Referral Earning Cap

### 1. Create `/terms` page (`src/pages/Terms.tsx`)
- Dark-themed page matching the landing page style
- Sections: About, How It Works, Referral Program Rules, Credit Policy, General Terms
- **Referral Rules** will prominently state:
  - Maximum earning cap: ₨2,000 per user
  - Once cap is reached, referral commissions stop for further recharges
  - Earnings can be withdrawn or exchanged for credits

### 2. Add subtle footer link
- In `src/pages/Index.tsx` footer: add a small, low-contrast "Terms & Rules" link
- In `src/pages/Dashboard.tsx`: add similar subtle link in footer area

### 3. Add route in `src/App.tsx`
- `/terms` → `Terms` page

### 4. Enforce ₨2,000 cap in database
- Update `process_referral_commission` function to check total earnings before adding commission
- If total `commission_rupees` for a referrer has reached ₨2,000, skip commission processing
- This is a schema/function change via migration

### Summary of changes
| File | Change |
|------|--------|
| `src/pages/Terms.tsx` | New page with rules content |
| `src/App.tsx` | Add `/terms` route |
| `src/pages/Index.tsx` | Add subtle footer link |
| Migration | Update `process_referral_commission` to enforce ₨2,000 cap |

