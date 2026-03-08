import { Link, useNavigate } from 'react-router-dom';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, UserPlus, Building, FileSpreadsheet, CheckCircle, Share2 } from 'lucide-react';
import { resultTemplates } from '@/lib/resultTemplates';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg sm:text-xl font-bold" style={{ color: '#a78bfa' }}>
            OnlineResultPortal
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium"
            style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {resultTemplates.length} Beautiful Design Templates
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight" style={{ color: '#f1f0f5' }}>
            Build beautiful
            <span style={{ color: '#a78bfa' }}> result portals</span>
            {' '}for your school
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#8b8a9e' }}>
            Upload student results, choose a stunning design, and share a branded link. Students check their results instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 w-full sm:w-auto" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Your Portal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 hover:bg-white/5 w-full sm:w-auto"
              style={{ color: '#c4c3d4' }}
              onClick={() => document.getElementById('designs')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Designs
            </Button>
          </div>
        </div>
      </section>

      {/* Design Grid */}
      <section className="container mx-auto px-4 py-10 sm:py-16" id="designs">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
            Choose Your Style
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-lg" style={{ color: '#8b8a9e' }}>
            Click any design to see a live demo with sample data
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 max-w-7xl mx-auto">
          {resultTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/demo/${t.id}`)}
              className="group rounded-lg sm:rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Mini preview */}
              <div
                className="h-28 sm:h-44 p-2 sm:p-4 flex flex-col justify-between relative overflow-hidden"
                style={{ background: t.background }}
              >
                {/* Fake portal preview */}
                <div className="space-y-1">
                  <div className="text-center">
                    <p className="text-[8px] sm:text-[10px] font-bold tracking-wide" style={{ color: t.accentColor }}>
                      Demo Academy
                    </p>
                    <p className="text-[6px] sm:text-[7px] uppercase tracking-[0.2em] sm:tracking-[0.3em]" style={{ color: t.textSecondary }}>
                      Student Result Portal
                    </p>
                  </div>
                </div>
                <div
                  className="rounded-md p-1.5 sm:p-2.5 space-y-1 sm:space-y-1.5 backdrop-blur-sm"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: t.borderRadius }}
                >
                  <div className="rounded h-3 sm:h-4" style={{ background: t.inputBg, border: `1px solid ${t.cardBorder}` }} />
                  <div className="rounded h-3 sm:h-4" style={{ background: t.inputBg, border: `1px solid ${t.cardBorder}` }} />
                  <div className="rounded h-4 sm:h-5 flex items-center justify-center" style={{ background: t.buttonGradient, borderRadius: t.borderRadius }}>
                    <span className="text-[6px] sm:text-[7px] font-semibold" style={{ color: ['glassmorphism', 'minimalist', 'kawaii'].includes(t.id) ? '#fff' : '#111' }}>
                      ✦ View Result
                    </span>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="px-2.5 py-2 sm:px-4 sm:py-3" style={{ background: 'rgba(15,16,33,0.95)' }}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: '#e4e3f1' }}>{t.name}</p>
                    <p className="text-[9px] sm:text-[11px] mt-0.5 truncate" style={{ color: '#6b6a80' }}>{t.description}</p>
                  </div>
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ml-2"
                    style={{ background: t.accentColor }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
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
          {([
            { step: 1, Icon: UserPlus, title: 'Create Account', desc: 'Sign up with your email in seconds — no technical skills needed.' },
            { step: 2, Icon: Building, title: 'Add Your School', desc: 'Enter your school name and choose a beautiful design template.' },
            { step: 3, Icon: FileSpreadsheet, title: 'Upload Results Excel', desc: 'Upload your student results spreadsheet — we handle the rest.' },
            { step: 4, Icon: CheckCircle, title: 'Preview & Confirm', desc: 'Review imported data, confirm column mapping, and publish.' },
            { step: 5, Icon: Share2, title: 'Share Your Link', desc: 'Share your branded portal link — students check results instantly.' },
          ] as const).map((item) => (
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
        <div
          className="max-w-2xl mx-auto rounded-2xl p-6 sm:p-10 space-y-4 sm:space-y-5"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#f1f0f5' }}>
            Ready to get started?
          </h2>
          <p className="text-sm sm:text-base" style={{ color: '#c4c3d4' }}>
            Each printed DMC costs over <strong style={{ color: '#a78bfa' }}>Rs. 50</strong> — deliver results digitally for just <strong style={{ color: '#a78bfa' }}>Rs. 9 per student</strong>.
          </p>
          <p className="text-xs sm:text-sm" style={{ color: '#8b8a9e' }}>
            Create your school's result portal in under 5 minutes. No coding needed. Start with 20 free credits!
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs sm:text-sm" style={{ color: '#6b6a80' }}>
          &copy; {new Date().getFullYear()} OnlineResultPortal. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
