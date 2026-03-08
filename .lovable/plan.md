

## Plan: Add "We Build It For You" WhatsApp CTA

Add a prominent section on the landing page and a button in the dashboard that lets non-technical users request the full setup service via WhatsApp with a pre-filled message.

### Changes

#### 1. Landing Page — New section before CTA (`src/pages/Index.tsx`)
Add a new "Done For You" section between `HowItWorks` and `CTASection` with:
- Heading: "Too busy? We'll set it up for you"
- Short description: "Just share your school name and result sheet — we'll create your portal, upload results, and hand it over ready to share."
- A WhatsApp button that opens chat with pre-filled message: "Assalam o Alaikum! I want you to set up my result portal. My school name is: ___"
- Styled consistently with the dark theme, using a subtle card with an icon

#### 2. Create component `src/components/landing/DoneForYouSection.tsx`
- Card with a Sparkles or Headphones icon
- 3 small bullet points: "Share school name & Google Sheet", "We configure everything", "You get a ready portal link"
- WhatsApp CTA button (green, prominent)

#### 3. Dashboard — Add a help banner (`src/pages/Dashboard.tsx`)
- Small banner or card at the top/bottom of dashboard: "Need help setting up? Let us do it for you"
- Links to the same WhatsApp pre-filled message
- Subtle, non-intrusive design (dismissible or collapsible)

### Files Modified
- New: `src/components/landing/DoneForYouSection.tsx`
- Edit: `src/pages/Index.tsx` — import and render the new section
- Edit: `src/pages/Dashboard.tsx` — add a small help banner

