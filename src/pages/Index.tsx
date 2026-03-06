import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { resultTemplates } from '@/lib/resultTemplates';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold" style={{ color: '#a78bfa' }}>
            ResultCheck
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {resultTemplates.length} Beautiful Design Templates
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight" style={{ color: '#f1f0f5' }}>
            Build beautiful
            <span style={{ color: '#a78bfa' }}> result portals</span>
            {' '}for your school
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#8b8a9e' }}>
            Upload student results, choose a stunning design, and share a branded link. Students check their results instantly.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Your Portal <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 hover:bg-white/5"
              style={{ color: '#c4c3d4' }}
              onClick={() => document.getElementById('designs')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Designs
            </Button>
          </div>
        </div>
      </section>

      {/* Design Grid */}
      <section className="container mx-auto px-4 py-16" id="designs">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
            Choose Your Style
          </h2>
          <p className="mt-3 text-lg" style={{ color: '#8b8a9e' }}>
            Click any design to see a live demo with sample data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {resultTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/demo/${t.id}`)}
              className="group rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Mini preview */}
              <div
                className="h-44 p-4 flex flex-col justify-between relative overflow-hidden"
                style={{ background: t.background }}
              >
                {/* Fake portal preview */}
                <div className="space-y-1.5">
                  <div className="text-center">
                    <p className="text-[10px] font-bold tracking-wide" style={{ color: t.accentColor }}>
                      Demo Academy
                    </p>
                    <p className="text-[7px] uppercase tracking-[0.3em]" style={{ color: t.textSecondary }}>
                      Student Result Portal
                    </p>
                  </div>
                </div>
                <div
                  className="rounded-md p-2.5 space-y-1.5 backdrop-blur-sm"
                  style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: t.borderRadius }}
                >
                  <div className="rounded h-4" style={{ background: t.inputBg, border: `1px solid ${t.cardBorder}` }} />
                  <div className="rounded h-4" style={{ background: t.inputBg, border: `1px solid ${t.cardBorder}` }} />
                  <div className="rounded h-5 flex items-center justify-center" style={{ background: t.buttonGradient, borderRadius: t.borderRadius }}>
                    <span className="text-[7px] font-semibold" style={{ color: ['glassmorphism', 'minimalist', 'kawaii'].includes(t.id) ? '#fff' : '#111' }}>
                      ✦ View Result
                    </span>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="px-4 py-3" style={{ background: 'rgba(15,16,33,0.95)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#e4e3f1' }}>{t.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#6b6a80' }}>{t.description}</p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: t.accentColor }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div
          className="max-w-2xl mx-auto rounded-2xl p-10 space-y-5"
          style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}
        >
          <h2 className="font-display text-3xl font-bold" style={{ color: '#f1f0f5' }}>
            Ready to get started?
          </h2>
          <p style={{ color: '#8b8a9e' }}>
            Create your school's result portal in under 5 minutes. No coding needed.
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
      <footer className="py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm" style={{ color: '#6b6a80' }}>
          &copy; {new Date().getFullYear()} ResultCheck. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
