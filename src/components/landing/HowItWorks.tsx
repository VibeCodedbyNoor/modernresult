import { UserPlus, Building, FileSpreadsheet, CheckCircle, Share2 } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HowItWorks() {
  const ref = useScrollReveal();
  const { t } = useLanguage();

  const steps = [
    { step: 1, Icon: UserPlus, titleKey: 'how.step1_title', descKey: 'how.step1_desc' },
    { step: 2, Icon: Building, titleKey: 'how.step2_title', descKey: 'how.step2_desc' },
    { step: 3, Icon: FileSpreadsheet, titleKey: 'how.step3_title', descKey: 'how.step3_desc' },
    { step: 4, Icon: CheckCircle, titleKey: 'how.step4_title', descKey: 'how.step4_desc' },
    { step: 5, Icon: Share2, titleKey: 'how.step5_title', descKey: 'how.step5_desc' },
  ] as const;

  return (
    <section className="container mx-auto px-4 py-12 sm:py-20">
      <div ref={ref} className="text-center mb-8 sm:mb-14">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
          {t('how.title')}
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg" style={{ color: '#8b8a9e' }}>
          {t('how.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {steps.map((item, i) => (
          <div
            key={item.step}
            className="relative rounded-xl p-5 sm:p-6 text-center space-y-3 transition-all duration-300 hover:scale-[1.03] animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              animationDelay: `${i * 100}ms`,
              animationFillMode: 'both',
            }}
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
              {t(item.titleKey)}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#8b8a9e' }}>
              {t(item.descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
