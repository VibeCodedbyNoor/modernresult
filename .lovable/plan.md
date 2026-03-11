

## Plan: Update EarnWithUs Page to PKR-Based Referral Earnings

The Dashboard already uses PKR-based logic (`commission_rupees || commission_credits * 9`), but the EarnWithUs page still shows everything in credits. We need to align it.

### Changes in `src/pages/EarnWithUs.tsx`:

1. **Earnings calculation** (line 87): Change from `commission_credits` to `commission_rupees || commission_credits * 9` (matching Dashboard logic)

2. **Stats cards** (lines 242-255): Change labels from credits to PKR:
   - "Total Earned" → show `₨{totalEarnings}`
   - "Withdrawn" → `₨{totalWithdrawn}`
   - "Available" → `₨{availableBalance}`

3. **Earnings history table** (lines 312-325): 
   - Change "Credits Purchased" → "Amount Recharged (PKR)"
   - Change "Your Commission (10%)" to show `+₨{commission_rupees || commission_credits * 9}`
   - Show PKR amount purchased instead of credits (use `credits_purchased * 9` as fallback or show the PKR value)

4. **Withdrawal form** (lines 330-365):
   - Change "Amount (Credits)" label → "Amount (PKR ₨)"
   - Update available balance display to show `₨{availableBalance}`
   - Update placeholder text accordingly

5. **Withdrawal history** (lines 370-390): Change `{w.amount} credits` → `₨{w.amount}`

6. **Hero section text** (lines 155-165): Update commission description from "10% commission" (credits-based) to "10% commission in PKR" — e.g., "earn 10% of every rupee they spend"

7. **How it works step 3** (line 151): Update description to mention PKR earnings instead of generic "earn 10%"

