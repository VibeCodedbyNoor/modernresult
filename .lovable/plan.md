

# Credit System Implementation Plan

## Summary
Add a credit system where school owners get 20 free credits on signup. Each student result check costs 1 credit (PKR 9). A 500-credit package includes a **bonus 50 free credits** (limited time). Payment via **Easypaisa: 03479104843 (Muhammad Irfan)** or manual bank transfer.

## How You'll Add Credits After Payment
Once the `school_credits` table exists, you'll update credits using the backend data editor:
```sql
-- Find the school's current balance
SELECT * FROM school_credits WHERE school_id = '<school-id>';

-- Add purchased credits (e.g., 550 for the 500+50 bonus package)
UPDATE school_credits SET balance = balance + 550 WHERE school_id = '<school-id>';

-- Log the transaction
INSERT INTO credit_transactions (school_id, amount, type, description)
VALUES ('<school-id>', 550, 'purchase', '500 credits + 50 bonus via Easypaisa');
```
You can do this directly from **Lovable Cloud** backend whenever you receive a payment screenshot.

## Database Changes (Migration)

### Table: `school_credits`
- `id` uuid PK, `school_id` uuid FK→schools (unique), `balance` int default 20, `created_at`, `updated_at`
- RLS: owners SELECT their own row

### Table: `credit_transactions`
- `id` uuid PK, `school_id` uuid FK→schools, `amount` int, `type` text, `description` text nullable, `created_at`
- RLS: owners SELECT their own transactions

### Function: `deduct_credit(p_school_id uuid)` returns boolean
- Security definer, checks balance > 0, deducts 1, logs 'result_check' transaction

### Trigger on `schools` INSERT
- Auto-creates credit row (balance=20) + logs 'signup_bonus' transaction

## Code Changes

### `src/pages/Dashboard.tsx` — Add Credits tab
- Balance display with visual indicator
- Credit packages:
  - 50 credits → PKR 450
  - 100 credits → PKR 900
  - **500 credits + 50 FREE bonus (limited time!) → PKR 4,500** ← highlighted
- Payment details: **Easypaisa: 03479104843 — Muhammad Irfan**
- Instructions: "Send payment & WhatsApp your receipt — credits added within 1 hour"
- Transaction history table
- Marketing hook: "A printed DMC costs over Rs. 50 — go digital for just Rs. 9/student"

### `src/pages/ResultPortal.tsx` — Credit deduction
- Call `deduct_credit` RPC before showing result
- If false → show "Results temporarily unavailable, contact your school"

### `src/pages/Index.tsx` — Add pricing hook
- In CTA or "How It Works" section: "Each printed DMC costs Rs. 50+ — deliver results digitally for just Rs. 9 per student"

