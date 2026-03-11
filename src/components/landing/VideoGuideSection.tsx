import { Card, CardContent } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function VideoGuideSection() {
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="mx-auto px-2 sm:px-4 py-10 sm:py-16 sm:container">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#f1f0f5' }}>
          📺 Video Guide
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#8b8a9e' }}>
          Watch the complete step-by-step tutorial
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card
          className="overflow-hidden border-0"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/mOJtmiu0ZiU"
              title="Online Result Portal – Complete Tutorial"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <CardContent className="p-4 text-center space-y-1">
            <p className="font-semibold text-lg" style={{ color: '#f1f0f5' }}>
              Online Result Portal – Complete Tutorial
            </p>
            <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: '#8b8a9e' }}>
              <Smartphone className="h-3.5 w-3.5" />
              Recorded on PC — the method is the same on mobile
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
