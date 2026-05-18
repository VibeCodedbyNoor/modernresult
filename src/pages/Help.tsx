import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, HelpCircle, MessageCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { helpVideos, videoTranslations } from '@/lib/helpVideos';
import ThemeToggle from '@/components/ThemeToggle';

export default function Help() {
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
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-primary text-lg">
            {t('nav.brand')}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" /> {t('help.back_home')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('help.title')}</h1>
          <p className="text-muted-foreground">{t('help.subtitle')}</p>
        </div>

        {/* Videos */}
        {availableVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableVideos.map(video => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={vt(video.titleKey)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <CardContent className="p-4">
                  <p className="font-semibold text-sm">{vt(video.titleKey)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{vt(video.descriptionKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <PlayCircle className="h-14 w-14 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">{t('help.no_videos')}</p>
            </CardContent>
          </Card>
        )}

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

        {/* WhatsApp */}
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <p className="font-semibold text-lg">{t('help.need_more_help')}</p>
            <a
              href="https://wa.me/923478312432?text=Assalam o Alaikum! I need help with my result portal."
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('help.contact_whatsapp')}
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
