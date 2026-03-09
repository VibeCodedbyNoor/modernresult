import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CTASection() {
  const ref = useScrollReveal();
  const { t } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-12 sm:py-20 text-center">
      <div
        ref={ref}
        className="max-w-2xl mx-auto rounded-2xl p-6 sm:p-10 space-y-4 sm:space-y-5"
        style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#f1f0f5' }}>
          {t('cta.title')}
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#c4c3d4' }}>
          {t('cta.subtitle_1')}<strong style={{ color: '#a78bfa' }}>{t('cta.subtitle_highlight')}</strong>{t('cta.subtitle_2')}
        </p>
        <p className="text-xs sm:text-sm" style={{ color: '#8b8a9e' }}>
          {t('cta.desc')}
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/signup">
            <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
              {t('cta.button')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
