

## Plan: Update Credit Packages

**File**: `src/pages/Dashboard.tsx` (lines 1056-1087)

Replace the 3 existing packages with the new pricing:

| Package | Credits | Price | Per Credit | Badge |
|---------|---------|-------|------------|-------|
| 🟢 School Starter | 100 | PKR 300 | 3.0 | — |
| 🔵 School Growth | 500 | PKR 1,350 | 2.7 | ⭐ Most Popular, Save PKR 150 |
| 🟣 School Premium | 1,000 | PKR 2,500 | 2.5 | Save PKR 500 |

### Changes:
1. **Update the plans array** (lines 1056-1059) with new credits, prices, per-credit values, and labels
2. **Add package names** ("School Starter", "School Growth", "School Premium") displayed above the credit count
3. **Add savings badges** — "Save PKR 150" on Growth, "Save PKR 500" on Premium
4. **Mark Growth as "Most Popular"** with a star badge (replacing the old "Best Value" on 500+50)
5. **Update the WhatsApp message** (line 1114) to reflect new amounts (300 / 1,350 / 2,500)
6. **Update the payment amount display** (line 1103) to match new prices

