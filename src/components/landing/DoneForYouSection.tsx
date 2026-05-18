import { Sparkles, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

const whatsappUrl = `https://wa.me/923478312432?text=${encodeURIComponent(
  "Assalam o Alaikum! I want you to set up my result portal.\n\nMy school name is: ___\nGoogle Sheet link: ___"
)}`;

export default function DoneForYouSection() {
  const ref = useScrollReveal();
  const { t } = useLanguage();

  const bullets = [t('done.bullet1'), t('done.bullet2'), t('done.bullet3')];

  return (
    <section className="container mx-auto px-4 py-12 sm:py-20">
      <div
        ref={ref}
        className="max-w-2xl mx-auto rounded-2xl p-6 sm:p-10 space-y-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(167,139,250,0.06))',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Sparkles className="h-6 w-6" style={{ color: '#22c55e' }} />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#f1f0f5' }}>
          {t('done.title')}
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#c4c3d4' }}>
          {t('done.subtitle')}
        </p>

        <ul className="space-y-2 text-left max-w-sm mx-auto">
          {bullets.map((text) => (
            <li key={text} className="flex items-start gap-2 text-sm" style={{ color: '#a5a4b8' }}>
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#22c55e' }} />
              {text}
            </li>
          ))}
        </ul>

        <a href={whatsappUrl} target="_blank" rel="noreferrer">
          <Button size="lg" className="gap-2 mt-2" style={{ background: '#22c55e', color: '#fff' }}>
            <MessageCircle className="h-4 w-4" />
            {t('done.cta')}
          </Button>
        </a>
      </div>
    </section>
  );
}
