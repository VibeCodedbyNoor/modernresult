import { useNavigate } from 'react-router-dom';
import { resultTemplates } from '@/lib/resultTemplates';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';

function DesignCard({ tmpl, index, onClick }: { tmpl: typeof resultTemplates[0]; index: number; onClick: () => void }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 animate-fade-in w-full"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        animationDelay: `${index * 50}ms`,
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
  );
}

function MobileCarousel() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const whatsappLink = `https://wa.me/923478312432?text=${encodeURIComponent("Hi! I'm interested in getting a custom design for my Result Portal.")}`;
  const totalSlides = resultTemplates.length + 1;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {resultTemplates.map((tmpl, i) => (
            <div key={tmpl.id} className="flex-[0_0_85%] min-w-0 px-2">
              <DesignCard tmpl={tmpl} index={i} onClick={() => navigate(`/demo/${tmpl.id}`)} />
            </div>
          ))}
          {/* Custom design CTA slide */}
          <div className="flex-[0_0_85%] min-w-0 px-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 flex flex-col items-center justify-center aspect-[4/3] w-full"
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
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(10,11,20,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <ChevronLeft className="w-4 h-4" style={{ color: '#a78bfa' }} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(10,11,20,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <ChevronRight className="w-4 h-4" style={{ color: '#a78bfa' }} />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-200"
            style={{
              background: i === selectedIndex ? '#a78bfa' : 'rgba(255,255,255,0.15)',
              width: i === selectedIndex ? '12px' : '6px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DesignGrid() {
  const navigate = useNavigate();
  const ref = useScrollReveal();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const whatsappLink = `https://wa.me/923478312432?text=${encodeURIComponent("Hi! I'm interested in getting a custom design for my Result Portal.")}`;

  return (
    <section className="mx-auto px-2 sm:px-4 py-10 sm:py-16" id="designs">
      <div ref={ref} className="text-center mb-6 sm:mb-12">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f1f0f5' }}>
          {t('designs.title')}
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg" style={{ color: '#8b8a9e' }}>
          {t('designs.subtitle')}
        </p>
      </div>

      {isMobile ? (
        <MobileCarousel />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 max-w-7xl mx-auto">
          {resultTemplates.map((tmpl, i) => (
            <DesignCard key={tmpl.id} tmpl={tmpl} index={i} onClick={() => navigate(`/demo/${tmpl.id}`)} />
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
      )}
    </section>
  );
}
