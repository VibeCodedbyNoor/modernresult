import { UserPlus, Building, FileSpreadsheet, CheckCircle, Share2 } from 'lucide-react';

const steps = [
  { step: 1, Icon: UserPlus, title: 'Create Account', desc: 'Sign up with your email in seconds — no technical skills needed.' },
  { step: 2, Icon: Building, title: 'Add Your School', desc: 'Enter your school name and choose a beautiful design template.' },
  { step: 3, Icon: FileSpreadsheet, title: 'Upload Results Excel', desc: 'Upload your student results spreadsheet — we handle the rest.' },
  { step: 4, Icon: CheckCircle, title: 'Preview & Confirm', desc: 'Review imported data, confirm column mapping, and publish.' },
  { step: 5, Icon: Share2, title: 'Share Your Link', desc: 'Share your branded portal link — students check results instantly.' },
] as const;

export default function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-8 sm:mb-14">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
          How to Get Started
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg" style={{ color: '#8b8a9e' }}>
          Set up your result portal in under 5 minutes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative rounded-xl p-5 sm:p-6 text-center space-y-3 transition-all duration-300 hover:scale-[1.03]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mx-auto"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              {item.step}
            </div>
            <div className="flex justify-center">
              <item.Icon className="h-7 w-7" style={{ color: '#a78bfa' }} />
            </div>
            <h3 className="font-display text-sm sm:text-base font-semibold" style={{ color: '#e4e3f1' }}>
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#8b8a9e' }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
