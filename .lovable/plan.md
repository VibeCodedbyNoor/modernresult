

# Add Step-by-Step Visual Guide on Landing Page

## What
Add a detailed "How It Works" section on the landing page between the Design Grid and the CTA. It will have 5 clear steps with icons, titles, and short descriptions — walking non-technical school owners through the entire process from signup to sharing results.

## Steps to show
1. **Create Account** — Sign up with your email in seconds (icon: UserPlus)
2. **Add Your School** — Enter your school name and choose a beautiful design template (icon: School/Building)
3. **Upload Results Excel** — Upload your student results spreadsheet — we handle the rest (icon: FileSpreadsheet)
4. **Preview & Confirm** — Review imported data, confirm column mapping, and publish (icon: CheckCircle)
5. **Share Your Link** — Share your branded portal link with students — they check results instantly (icon: Share2/Link)

## Design
- Dark themed cards matching existing landing page style
- Each card: numbered badge (purple accent), lucide icon, title, 1-line description
- Responsive: 1 column on mobile, 3+2 or 5 columns on desktop
- Section heading: "How to Get Started" with subtitle "Set up your result portal in under 5 minutes"

## File changes
- **`src/pages/Index.tsx`** — Add the new section between the Design Grid (`</section>`) and the CTA section. Uses only lucide-react icons (already installed), no external images needed.

