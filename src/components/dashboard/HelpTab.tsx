import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Sparkles, Upload, Palette, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const QUICK_STEPS = [
  { icon: Upload, title: 'Upload your results', desc: 'Use the Excel/CSV uploader — your file headers are mapped automatically.' },
  { icon: Palette, title: 'Pick a design', desc: 'Choose any of the basic themes on Free, or unlock all 22+ themes with Pro.' },
  { icon: ShieldCheck, title: 'Share your portal link', desc: 'Send students your /results/your-school link — no extra setup needed.' },
];

export default function HelpTab() {
  const { t } = useLanguage();

  const faqs = [
    { q: t('help.faq1_q'), a: t('help.faq1_a') },
    { q: t('help.faq2_q'), a: t('help.faq2_a') },
    { q: t('help.faq3_q'), a: t('help.faq3_a') },
    { q: t('help.faq4_q'), a: t('help.faq4_a') },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* What's new — Free plan */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            ResultPortal is now Free Forever
          </CardTitle>
          <CardDescription>
            No more credits to buy. Publish unlimited student results without paying a rupee.
            Upgrade to Pro any time for a premium experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_STEPS.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
                <s.icon className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/dashboard/billing">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" /> See Pro features
            </Button>
          </Link>
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
            href="https://wa.me/923478312432?text=Assalam o Alaikum! I need help with my result portal."
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
