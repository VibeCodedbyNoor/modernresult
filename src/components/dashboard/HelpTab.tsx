import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { helpVideos, videoTranslations } from '@/lib/helpVideos';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpTab() {
  const { t, lang } = useLanguage();
  const vt = (key: string) => videoTranslations[lang]?.[key] || videoTranslations['en']?.[key] || key;

  const availableVideos = helpVideos.filter(v => v.youtubeId);

  const faqs = [
    { q: t('help.faq1_q'), a: t('help.faq1_a') },
    { q: t('help.faq2_q'), a: t('help.faq2_a') },
    { q: t('help.faq3_q'), a: t('help.faq3_a') },
    { q: t('help.faq4_q'), a: t('help.faq4_a') },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Video Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            {t('help.title')}
          </CardTitle>
          <CardDescription>{t('help.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {availableVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableVideos.map(video => (
                <div key={video.id} className="rounded-lg border border-border overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={vt(video.titleKey)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{vt(video.titleKey)}</p>
                    <p className="text-xs text-muted-foreground">{vt(video.descriptionKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t('help.no_videos')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('help.faq_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* WhatsApp Help */}
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <p className="font-semibold">{t('help.need_more_help')}</p>
          <a
            href="https://wa.me/923479104843?text=Assalam o Alaikum! I need help with my result portal."
            target="_blank"
            rel="noreferrer"
          >
            <Button className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {t('help.contact_whatsapp')}
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
