import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';
import { ArrowRight } from 'lucide-react';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is ResultPortal.online?',
    a: 'ResultPortal.online is an online exam result publishing platform for schools, madrasas, colleges and coaching centers. Schools upload student marks via Excel or Google Sheets and instantly get a branded portal where students and parents check results by roll number or name.',
  },
  {
    q: 'Is ResultPortal.online really free for schools?',
    a: 'Yes. The Free Forever plan lets any school publish unlimited student results with no credit card required. The Pro plan removes ads, unlocks all 22+ portal designs, branded PDF marksheets (DMC), password-protected exams and countdown timers.',
  },
  {
    q: 'How do I publish my school results online?',
    a: 'Sign up in under 60 seconds, choose a portal design, upload your Excel/CSV with student names, roll numbers and marks, then share your unique link like resultportal.online/results/your-school-name. Students can check results instantly from any phone or computer.',
  },
  {
    q: 'Do students need to sign up or install an app?',
    a: 'No. Students and parents just open the school link and enter roll number or name — no signup, no app install, no login. Results load instantly and are mobile-friendly.',
  },
  {
    q: 'Can I download a printable marksheet (DMC) PDF?',
    a: 'Yes. Every result page has a Download DMC button that generates a branded PDF marksheet with school logo, student details, subject-wise marks, grade, percentage and position. Admins can choose from 5 DMC templates (Classic, Modern, Elegant, Compact, Premium).',
  },
  {
    q: 'What file formats can I upload?',
    a: 'Excel (.xlsx, .xls), CSV files, and Google Sheets. Our smart column mapper auto-detects student name, roll number, class and subject columns even if your file uses different headers.',
  },
  {
    q: 'How much does the Pro plan cost?',
    a: 'The Pro plan is $20/month (approximately 5,600 PKR) and includes ad-free student portals, all 22+ premium designs, branded PDF marksheets, password protection, result countdown timers and priority WhatsApp support.',
  },
  {
    q: 'Which schools can use ResultPortal.online?',
    a: 'Any educational institution — primary schools, high schools, matric and FSC colleges, madrasas, Islamic academies, coaching centers, tuition centers and universities. The platform is used widely across Pakistan, India, Bangladesh and Ethiopia.',
  },
  {
    q: 'Is my school data secure?',
    a: 'Yes. All data is stored on encrypted cloud infrastructure with row-level security. Only your school admin can edit or delete results. Student results are visible on your public link but cannot be modified by anyone else.',
  },
  {
    q: 'Can I control when students see their results?',
    a: 'Yes. Every exam has a Start and Stop toggle. You can schedule a result release time with a live countdown timer shown to students, and instantly pause results if you need to make corrections.',
  },
  {
    q: 'Do you support Urdu language?',
    a: 'The school dashboard supports English and Urdu (with full right-to-left layout). Student result portals are currently English-only for maximum compatibility across devices.',
  },
  {
    q: 'How does the referral / earning program work?',
    a: 'Refer other schools and earn 10% commission in PKR on every paid credit purchase they make. Minimum withdrawal is 400 PKR, paid via JazzCash or Easypaisa. See /earn for full details.',
  },
  {
    q: 'What is the difference between ResultPortal.online and building a website?',
    a: 'A custom website costs 30,000–100,000 PKR and takes weeks. ResultPortal.online launches your result system in minutes for free, with automatic student search, mobile design, PDF generation and unlimited exams built in.',
  },
  {
    q: 'How do I get help or contact support?',
    a: 'Direct WhatsApp support is available at +92 347 8312432. You can also use the built-in AI assistant on the dashboard, watch video tutorials in the Help section, or email through the platform.',
  },
];

export default function FAQ() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      <SEO
        title="FAQ — ResultPortal.online | Online Exam Result Portal for Schools"
        description="Answers to common questions about publishing school exam results online, uploading Excel data, printable DMC marksheets, pricing, referral earnings, and support."
        path="/faq"
        jsonLd={faqSchema}
      />

      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-sm sm:text-xl font-bold" style={{ color: '#a78bfa' }}>
            ResultPortal
          </Link>
          <Link to="/signup">
            <Button size="sm" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl">
        <header className="text-center mb-10 sm:mb-14">
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg" style={{ color: '#8b8a9e' }}>
            Everything schools, madrasas and coaching centers ask before publishing exam results online with ResultPortal.online.
          </p>
        </header>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border px-4"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <AccordionTrigger className="text-left text-white hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent style={{ color: '#a5a4b8' }}>
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section className="mt-14 rounded-2xl p-6 sm:p-10 text-center space-y-4"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.10) 0%, rgba(109,40,217,0.10) 100%)',
            border: '1px solid rgba(167,139,250,0.25)',
          }}
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Ready to publish your school results online?
          </h2>
          <p className="text-sm sm:text-base" style={{ color: '#a5a4b8' }}>
            Free forever — no credit card required. Launch your school result portal in under 5 minutes.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs sm:text-sm" style={{ color: '#6b6a80', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p>&copy; {new Date().getFullYear()} ResultPortal.online — All rights reserved.</p>
      </footer>
      <WhatsAppHelpButton />
    </div>
  );
}
