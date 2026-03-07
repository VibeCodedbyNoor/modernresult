

# Bulk PDF Marksheet Generation with Credit System

## Feature Summary
Add a "Download Marksheets (PDF)" feature to the Dashboard with paper size selection, class filtering, student selection/deselection, and a credit-based pricing model:
- **1 credit per student** for up to 400 students
- **0.8 credits per student** (rounded) for 400+ students

## Credit Pricing Logic
```text
Students <= 400: cost = studentCount * 1
Students >  400: cost = studentCount * 0.8 (rounded up)
```
The cost is shown before generation. Owner must confirm. If insufficient credits, block generation and show balance.

## Implementation Steps

### 1. Install `jspdf` package

### 2. Create `src/components/MarksheetCard.tsx`
Extract the off-screen marksheet card layout (lines 510-574 of `ResultPortal.tsx`) into a reusable component that accepts a student result, school data, and template config.

### 3. Create `src/components/BulkMarksheetGenerator.tsx`
A dialog component with:
- **Paper size dropdown** at top: A4, Letter, Legal, A3
- **Class filter dropdown**: filters student list by class
- **Student list with checkboxes**: select all / deselect all toggle, individual checkboxes per student (showing name + roll number)
- **Cost summary**: "Selected: 25 students — Cost: 25 credits" (or "500 students — Cost: 400 credits" for bulk discount)
- **Credit balance display**: Shows current balance and whether it's sufficient
- **Generate PDF button**: disabled if insufficient credits
- On generate:
  1. Call `deduct_credit` equivalent (new DB function for bulk deduction)
  2. Render each selected student's marksheet off-screen using `MarksheetCard`
  3. Capture with `html2canvas`, add to `jsPDF` with correct paper dimensions
  4. Show progress bar ("Generating 3/25...")
  5. Download final PDF

### 4. New database function: `deduct_credits_bulk`
A security-definer function that:
- Takes `p_school_id`, `p_count` (number of students)
- Calculates cost: if count > 400 then `ceil(count * 0.8)` else `count`
- Checks balance >= cost
- Deducts cost from `school_credits`
- Inserts a single `credit_transactions` record with type `'bulk_marksheet'` and description like "Bulk marksheet download — 25 students"
- Returns the cost deducted (or 0 if insufficient)

```sql
CREATE OR REPLACE FUNCTION public.deduct_credits_bulk(p_school_id uuid, p_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cost integer;
  current_balance integer;
BEGIN
  IF p_count > 400 THEN
    cost := ceil(p_count * 0.8);
  ELSE
    cost := p_count;
  END IF;

  SELECT balance INTO current_balance
  FROM public.school_credits
  WHERE school_id = p_school_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < cost THEN
    RETURN 0;
  END IF;

  UPDATE public.school_credits
  SET balance = balance - cost, updated_at = now()
  WHERE school_id = p_school_id;

  INSERT INTO public.credit_transactions (school_id, amount, type, description)
  VALUES (p_school_id, -cost, 'bulk_marksheet',
    'Bulk marksheet download — ' || p_count || ' students');

  RETURN cost;
END;
$$;
```

### 5. Dashboard changes (`Dashboard.tsx`)
- Add "Download Marksheets" button in the exam actions area
- Button opens `BulkMarksheetGenerator` dialog, passing results, school data, selected exam, class names, and current credit balance

### 6. Paper size mapping
```text
A4:     595 x 842 pt
Letter: 612 x 792 pt
Legal:  612 x 1008 pt
A3:     842 x 1191 pt
```

## Flow
```text
Dashboard → Select Exam → Click "Download Marksheets"
→ Dialog: pick paper size, pick class, check/uncheck students
→ See cost summary: "25 students = 25 credits" (balance: 100)
→ Click "Generate PDF" → Credits deducted → Progress bar
→ PDF downloads (one marksheet per page)
```

