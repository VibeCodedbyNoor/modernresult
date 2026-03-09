import { useNavigate } from 'react-router-dom';
import { resultTemplates } from '@/lib/resultTemplates';
import { MessageCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DesignGrid() {
  const navigate = useNavigate();
  const ref = useScrollReveal();
  const { t } = useLanguage();

  const whatsappLink = `https://wa.me/923479104843?text=${encodeURIComponent("Hi! I'm interested in getting a custom design for my Result Portal.")}`;

  return (
    <section className="container mx-auto px-4 py-10 sm:py-16" id="designs">
      <div ref={ref} className="text-center mb-8 sm:mb-12">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
          {t('designs.title')}
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg" style={{ color: '#8b8a9e' }}>
          {t('designs.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 max-w-7xl mx-auto">
        {resultTemplates.map((tmpl, i) => (
          <button
            key={tmpl.id}
            onClick={() => navigate(`/demo/${tmpl.id}`)}
            className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 animate-fade-in"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              animationDelay: `${i * 50}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <iframe
                src={`/demo/${tmpl.id}`}
                title={tmpl.name}
                className="absolute top-0 left-0 pointer-events-none border-0"
                style={{ width: '400%', height: '400%', transform: 'scale(0.25)', transformOrigin: 'top left' }}
                loading="lazy"
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}
                >
                  {t('designs.try_demo')}
                </span>
              </div>
            </div>
            <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between" style={{ background: 'rgba(15,16,33,0.95)' }}>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: '#e4e3f1' }}>{tmpl.name}</p>
                <p className="text-[9px] sm:text-[11px] mt-0.5 truncate" style={{ color: '#6b6a80' }}>{tmpl.school}</p>
              </div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ml-2" style={{ background: tmpl.accentColor }} />
            </div>
          </button>
        ))}

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 flex flex-col items-center justify-center aspect-[4/3]"
          style={{ border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <MessageCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#e4e3f1' }}>{t('designs.custom_title')}</p>
              <p className="text-[11px] mt-1" style={{ color: '#6b6a80' }}>{t('designs.custom_subtitle')}</p>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
