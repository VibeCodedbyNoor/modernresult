import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PlayCircle, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { helpVideos, videoTranslations } from '@/lib/helpVideos';
import { useState } from 'react';

interface GettingStartedCardProps {
  hasExams: boolean;
  hasResults: boolean;
  hasPublished: boolean;
}

export default function GettingStartedCard({ hasExams, hasResults, hasPublished }: GettingStartedCardProps) {
  const { t, lang } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const vt = (key: string) => videoTranslations[lang]?.[key] || videoTranslations['en']?.[key] || key;

  const overviewVideo = helpVideos.find(v => v.id === 'overview');

  const steps = [
    { done: hasExams, label: t('dash.step_create_exam') },
    { done: hasResults, label: t('dash.step_upload') },
    { done: hasPublished, label: t('dash.step_publish') },
  ];

  if (hasExams && hasResults && hasPublished) return null;

  return (
    <>
      <Card className="border-primary/20 bg-primary/5 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            {t('dash.getting_started')}
          </CardTitle>
          <CardDescription>{t('dash.getting_started_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overviewVideo?.youtubeId && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowVideo(true)}>
              <PlayCircle className="h-4 w-4" /> {t('dash.watch_video')}
            </Button>
          )}

          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={step.done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video opens in a dialog instead of inline */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${overviewVideo?.youtubeId}?autoplay=1`}
              title={overviewVideo ? vt(overviewVideo.titleKey) : ''}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
