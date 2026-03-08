

## Issues to Fix

### 1. Referral Dashboard Not Showing Who Joined
The dashboard fetches referrals but doesn't display them. The referrals list (`ReferralData`) only contains `referred_user_id` - it needs to join with profiles to show names/school info.

### 2. Referral Commission Not Being Added on Credit Top-up
Looking at `add_credits_admin` function - it calls `process_referral_commission`, which looks up the school owner's `referred_by` field. The issue: when a new user signs up with a referral code, the signup flow stores `referred_by` in profiles correctly, BUT the commission function needs the **school's owner_id** to find the referred user - and schools are created AFTER signup.

The bug: When admin tops up credits, `process_referral_commission` gets the `owner_id` from schools table, then checks `profiles.referred_by`. This should work IF the user was properly marked as referred during signup.

Possible issues:
- Profile update may be failing silently during signup
- The referral code lookup is case-sensitive and might not match

### 3. Change Commission from Credits to Rupees (PKR)
Current: Stores `commission_credits` (10% of credits)
Needed: Store commission in PKR (rupees) instead

Formula: 1 credit = PKR 9, so commission = `credits_purchased * 9 * 0.10` = `credits_purchased * 0.9`

### 4. Add "Exchange Rupees for Credits" Option
Users should be able to convert their rupee earnings into credits via WhatsApp request flow.

---

## Plan

### Database Changes
1. **Add `commission_rupees` column to `referral_earnings`** - Store PKR amount instead of credits
2. **Update `process_referral_commission` function** - Calculate 10% in PKR (credits × 9 × 0.10)
3. **Update `withdrawal_requests` table** - Change amount interpretation to PKR

### Dashboard Changes (`src/pages/Dashboard.tsx`)
1. **Show Referred Users List** - Add a "Your Referrals" section displaying:
   - Joined date
   - Masked school name (first 3 chars + ***)
   - Status (active/inactive based on credit purchases)

2. **Fix Referral Data Fetching** - Join referrals with profiles to get school_name

3. **Update Earnings Display** - Show amounts in PKR (₨) not credits:
   - Total Earned: "₨ X"
   - Available Balance: "₨ Y"
   - Commission History: Show "₨ Z" per transaction

4. **Add "Exchange for Credits" Section**:
   - Card explaining: "Convert your earnings to credits"
   - Input for PKR amount to convert
   - Rate display: "₨ 9 = 1 Credit"
   - WhatsApp button with pre-filled message to admin

5. **Update Withdrawal Form** - Change labels to PKR

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Show referrals list, update to PKR, add exchange option |
| Migration | Add `commission_rupees` column, update function |

### Technical Details
- Referral list query: Join `referrals` → `profiles` on `referred_user_id = user_id` to get school_name
- PKR calculation: `commission_rupees = credits_purchased * 0.9` (10% of credits × 9)
- Exchange rate: Fixed at ₨9 per credit
- WhatsApp exchange message: "I want to convert ₨X of my referral earnings to credits (Y credits)"

