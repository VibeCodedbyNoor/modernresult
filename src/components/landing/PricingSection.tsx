import { useEffect, useState } from 'react';
import { Check, MessageCircle, Sparkles, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Region = 'PK' | 'INTL' | null;

interface Plan {
  name: string;
  credits: number;
  price: number;
  currency: 'PKR' | 'USD';
  popular?: boolean;
  savePct?: number;
  tagline: string;
}

const PK_PLANS: Plan[] = [
  { name: 'School Starter', credits: 100, price: 900, currency: 'PKR', tagline: 'Best for trying out' },
  { name: 'School Growth', credits: 500, price: 4050, currency: 'PKR', popular: true, savePct: 10, tagline: 'Most popular' },
  { name: 'School Premium', credits: 1000, price: 7500, currency: 'PKR', savePct: 17, tagline: 'Best value' },
];

const INTL_PLANS: Plan[] = [
  { name: 'Starter', credits: 100, price: 2.99, currency: 'USD', tagline: 'Try it out' },
  { name: 'Growth', credits: 500, price: 8.99, currency: 'USD', popular: true, savePct: 40, tagline: 'Most popular' },
  { name: 'Premium', credits: 1000, price: 17.99, currency: 'USD', savePct: 40, tagline: 'Best value' },
];

function detectRegion(): Promise<Region> {
  return new Promise((resolve) => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Karachi') || tz.includes('Islamabad')) return resolve('PK');
    } catch {}
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 2500);
    fetch('https://ipapi.co/country/', { signal: ctrl.signal })
      .then((r) => r.text())
      .then((code) => {
        clearTimeout(timeout);
        resolve(code.trim().toUpperCase() === 'PK' ? 'PK' : 'INTL');
      })
      .catch(() => resolve('INTL'));
  });
}

function formatPrice(plan: Plan) {
  if (plan.currency === 'USD') return `$${plan.price.toFixed(2)}`;
  return `PKR ${plan.price.toLocaleString()}`;
}

export default function PricingSection() {
  const [region, setRegion] = useState<Region>(null);
  const [override, setOverride] = useState<Region>(null);

  useEffect(() => {
    detectRegion().then(setRegion);
  }, []);

  const active: Region = override || region || 'INTL';
  const plans = active === 'PK' ? PK_PLANS : INTL_PLANS;

  const waText = active === 'PK'
    ? 'Assalam o Alaikum! I want to buy Result Credits for my school.'
    : "Hello! I'm interested in your international plan for my school. Please share payment details.";
  const waUrl = `https://wa.me/923478312432?text=${encodeURIComponent(waText)}`;

  return (
    <section id="pricing" className="py-16 sm:py-24 px-3 sm:px-4" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.04) 50%, transparent 100%)' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Sparkles className="h-3 w-3" /> Simple, transparent pricing
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold mb-3" style={{ color: '#fff' }}>
            Pay only for what you use
          </h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: '#8b8a9e' }}>
            Result Credits never expire. 10 credits per result upload. Start with 20 free credits — no card required.
          </p>

          {/* Region toggle */}
          <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setOverride('PK')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${active === 'PK' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              style={active === 'PK' ? { background: 'linear-gradient(90deg, #a78bfa, #6d28d9)' } : {}}
            >
              <MapPin className="h-3.5 w-3.5" /> Pakistan (PKR)
            </button>
            <button
              onClick={() => setOverride('INTL')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${active === 'INTL' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              style={active === 'INTL' ? { background: 'linear-gradient(90deg, #a78bfa, #6d28d9)' } : {}}
            >
              <Globe className="h-3.5 w-3.5" /> International (USD)
            </button>
          </div>
          {region && (
            <p className="text-[11px] mt-2" style={{ color: '#6b6a80' }}>
              {region === 'PK' ? '🇵🇰 We detected you’re in Pakistan' : '🌍 Showing international plans'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => {
            const perCredit = plan.price / plan.credits;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all hover:-translate-y-1 ${plan.popular ? 'md:-translate-y-2 md:hover:-translate-y-3' : ''}`}
                style={{
                  background: plan.popular
                    ? 'linear-gradient(180deg, rgba(167,139,250,0.12) 0%, rgba(109,40,217,0.08) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: plan.popular ? '1.5px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.popular ? '0 20px 60px -20px rgba(167,139,250,0.4)' : 'none',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                {plan.savePct ? (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                    Save {plan.savePct}%
                  </div>
                ) : null}

                <h3 className="font-display text-lg sm:text-xl font-bold mb-1" style={{ color: '#fff' }}>{plan.name}</h3>
                <p className="text-xs mb-5" style={{ color: '#8b8a9e' }}>{plan.tagline}</p>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-bold" style={{ color: '#fff' }}>{formatPrice(plan)}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#6b6a80' }}>
                    {plan.currency === 'USD' ? `~$${perCredit.toFixed(3)}` : `Rs. ${perCredit.toFixed(2)}`} per credit
                  </p>
                </div>

                <div className="mb-6">
                  <div className="text-2xl font-bold" style={{ color: '#a78bfa' }}>{plan.credits.toLocaleString()}</div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#8b8a9e' }}>Result Credits</div>
                </div>

                <ul className="space-y-2.5 mb-6 text-sm" style={{ color: '#cbd5e1' }}>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} /> {(plan.credits / 10).toLocaleString()} result uploads</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} /> All 22+ portal designs</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} /> Credits never expire</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} /> WhatsApp support</li>
                </ul>

                <a href={waUrl} target="_blank" rel="noreferrer" className="block">
                  <Button
                    className="w-full gap-2"
                    style={plan.popular
                      ? { background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff', border: 'none' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {active === 'PK' ? 'Buy on WhatsApp' : 'Contact on WhatsApp'}
                  </Button>
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-2">
          {active === 'INTL' && (
            <p className="text-xs sm:text-sm" style={{ color: '#8b8a9e' }}>
              💬 Payments are handled manually via WhatsApp. We accept Wise, bank transfer, and other international methods on request.
            </p>
          )}
          {active === 'PK' && (
            <p className="text-xs sm:text-sm" style={{ color: '#8b8a9e' }}>
              💳 Pay via EasyPaisa / JazzCash to <strong style={{ color: '#fff' }}>03341212432</strong> (NOOR REHMAN), then send screenshot on WhatsApp.
            </p>
          )}
          <p className="text-[11px]" style={{ color: '#6b6a80' }}>
            Trusted by schools across Pakistan and abroad · Secure · No subscription · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
