import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { helpVideos, videoTranslations } from '@/lib/helpVideos';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t, lang } = useLanguage();
  const vt = (key: string) => videoTranslations[lang]?.[key] || videoTranslations['en']?.[key] || key;
  
  const availableVideos = helpVideos.filter(v => v.youtubeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t('dash.tab_help')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {availableVideos.length > 0 ? (
            availableVideos.map(video => (
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
            ))
          ) : (
            <div className="text-center py-8 space-y-3">
              <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t('help.no_videos')}</p>
            </div>
          )}
          
          <a
            href="https://wa.me/923479104843?text=Assalam o Alaikum! I need help with my result portal."
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" className="w-full gap-2">
              {t('help.contact_whatsapp')}
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
