

## Plan: Rebrand "ResultCheck" → "OnlineResultPortal" + Custom Favicon

### Issue 1: Brand Name
Found "ResultCheck" in 5 files — need to replace all with "OnlineResultPortal":

1. **`src/pages/Login.tsx`** line 35 — brand link text
2. **`src/pages/Signup.tsx`** line 90 — brand link text
3. **`src/pages/Dashboard.tsx`** line 701 — navbar brand
4. **`src/pages/AdminDashboard.tsx`** lines 247, 255, 316 — WhatsApp message + subtitle
5. **`src/components/WhatsAppHelpButton.tsx`** line 4 — WhatsApp help message

### Issue 2: Favicon (Lovable logo in browser tab)
The current `public/favicon.ico` shows the Lovable logo. Since no custom image was provided, I'll generate a simple SVG favicon — a graduation cap or "R" monogram in the brand purple (#a78bfa) — and reference it in `index.html`.

### Files to modify
- `src/pages/Login.tsx` — brand text
- `src/pages/Signup.tsx` — brand text
- `src/pages/Dashboard.tsx` — brand text
- `src/pages/AdminDashboard.tsx` — brand text (3 places)
- `src/components/WhatsAppHelpButton.tsx` — WhatsApp message text
- `public/favicon.svg` — create new SVG favicon
- `index.html` — update favicon link to use new SVG

