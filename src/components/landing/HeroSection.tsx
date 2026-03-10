import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { resultTemplates } from '@/lib/resultTemplates';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const ref = useScrollReveal();
  const { t } = useLanguage();

  return (
    <section className="container mx-auto px-4 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
      <div ref={ref} className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium"
          style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          {resultTemplates.length} {t('hero.badge')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight" style={{ color: '#f1f0f5' }}>
          {t('hero.title_1')}
          <span style={{ color: '#a78bfa' }}>{t('hero.title_highlight')}</span>
          {t('hero.title_2')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#8b8a9e' }}>
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2 w-full sm:w-auto" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
              {t('hero.cta')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto font-medium"
            style={{ color: '#ffffff', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => document.getElementById('designs')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.view_designs')}
          </Button>
        </div>
      </div>
    </section>
  );
}
