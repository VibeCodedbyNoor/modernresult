
# ResultCheck SaaS — Online Result Checking Platform

## Overview
A multi-tenant SaaS where school/academy owners sign up, brand their page, upload student results (via Google Sheets or CSV), and students check results online by roll number or name. Includes subscription-based monetization.

## Pages & Features

### 1. Landing Page
- Hero section explaining the service ("Launch your school's online result portal in minutes")
- Feature highlights, pricing plans, and a CTA to sign up

### 2. Auth (Login / Signup)
- School owner registration with email/password
- Login page with forgot password flow

### 3. Owner Dashboard
- **Setup wizard** on first login: enter school name, upload logo, choose accent color, set a unique URL slug (e.g., `/results/greenfield-academy`)
- **Result management**: 
  - Upload CSV/Excel file with student results
  - Paste a Google Sheets link (public sheet) — system reads and imports the data
  - View, edit, and delete uploaded results
  - Support multiple exams/sessions (e.g., "Mid-Term 2026", "Final 2026")
- **Preview** their public result page before publishing

### 4. Public Result Checking Page (`/results/:school-slug`)
- Branded with school logo, name, and colors
- Student enters **roll number** or **name** to search
- Displays result in a clean card/table format (subjects, marks, grade, pass/fail)
- Option to download/print result as PDF

### 5. Subscription & Pricing
- Free trial or limited free tier
- Paid plans (e.g., Basic, Pro) with Stripe integration
- Subscription management in the dashboard

### 6. Admin Panel (for you as the platform owner)
- View all registered schools
- Manage subscriptions and plans
- Overview analytics (total schools, total results, etc.)

## Backend (Supabase)
- **Auth**: Supabase Auth for school owners
- **Database tables**: schools, exams, results, subscriptions
- **Storage**: School logos and uploaded CSV files
- **Row-Level Security**: Each school owner only sees their own data
- **Google Sheets integration**: Edge function to fetch and parse public Google Sheets data

## Data Flow
1. School owner signs up → completes setup (name, logo, slug)
2. Owner creates an exam session → uploads results via CSV or Google Sheets link
3. Students visit `/results/school-slug` → search by roll number or name → view result

## Design
- Clean, modern UI with shadcn components
- Mobile-responsive (students will mostly use phones)
- Each school's public page uses their uploaded logo and chosen color accent
