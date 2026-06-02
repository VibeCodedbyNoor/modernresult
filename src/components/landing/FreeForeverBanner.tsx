import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Star, MessageCircle, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const PRO_ROWS = [
  { label: 'Price', free: 'Free forever', pro: '$20/month' },
  { label: 'Ads on result pages', free: 'Shown', pro: 'No ads' },
  { label: 'Themes', free: 'Basic themes', pro: 'All 22+ themes' },
  { label: 'Branded PDF marksheet', free: '—', pro: 'Included' },
  { label: 'Password-protected exams', free: '—', pro: 'Included' },
  { label: 'Result countdown timer', free: '—', pro: 'Included' },
];

export default function FreeForeverBanner() {
  const [showCompare, setShowCompare] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSeePro = () => {
    if (!user) {
      toast({
        title: 'Please sign in first',
        description: 'Create a free account to view Pro features.',
      });
      navigate('/signup');
      return;
    }
    setShowCompare((v) => !v);
    setTimeout(() => {
      document.getElementById('plan-compare')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };


  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <div
        className="rounded-2xl p-6 sm:p-10 text-center space-y-5"
        style={{
          background:
            'linear-gradient(135deg, rgba(167,139,250,0.10) 0%, rgba(109,40,217,0.10) 100%)',
          border: '1px solid rgba(167,139,250,0.25)',
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Free Forever — No Credit Card Required
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Publish unlimited student results for free.
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#a5a4b8' }}>
          Upgrade to Pro anytime for a premium experience — branded PDFs, all themes, zero ads.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/signup">
            <Button size="lg" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
              Get Started Free
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSeePro}
          >
            {user ? <Star className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
            See Pro Features
          </Button>

        </div>

        {showCompare && (
          <div id="plan-compare" className="mt-8 max-w-2xl mx-auto rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide" style={{ color: '#8b8a9e' }}>Feature</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide" style={{ color: '#8b8a9e' }}>Free</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-amber-400">Pro</th>
                </tr>
              </thead>
              <tbody>
                {PRO_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td className="px-4 py-3 text-white">{row.label}</td>
                    <td className="px-4 py-3" style={{ color: '#a5a4b8' }}>{row.free}</td>
                    <td className="px-4 py-3 text-white">{row.pro}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#8b8a9e' }}>Current</span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href="https://wa.me/923478312432?text=I%20want%20to%20upgrade%20to%20Pro%20plan"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                        <MessageCircle className="h-3.5 w-3.5" /> Contact on WhatsApp
                      </Button>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
