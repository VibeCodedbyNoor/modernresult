import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface VideoConfig {
  id: string;
  title: string;
  language: string;
  youtubeId: string;
}

// Add your real YouTube video IDs here
const videos: VideoConfig[] = [
  {
    id: 'urdu',
    title: 'اردو میں سیکھیں',
    language: 'Urdu Guide',
    youtubeId: 'rh5KMo02dTU',
  },
  {
    id: 'pashto',
    title: 'په پښتو کې زده کړئ',
    language: 'Pashto Guide',
    youtubeId: 'rh5KMo02dTU',
  },
];

export default function VideoGuideSection() {
  const ref = useScrollReveal();

  const availableVideos = videos.filter(v => v.youtubeId);

  // Hide section if no videos are configured
  if (availableVideos.length === 0) return null;

  return (
    <section ref={ref} className="mx-auto px-2 sm:px-4 py-10 sm:py-16 sm:container">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#f1f0f5' }}>
          📺 Video Guide
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#8b8a9e' }}>
          Watch step-by-step tutorial in your language
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {videos.map(video => (
          <Card
            key={video.id}
            className="overflow-hidden border-0"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="aspect-video flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-center space-y-2">
                <PlayCircle className="h-10 w-10 mx-auto" style={{ color: '#6d28d9' }} />
                <p className="text-sm font-medium" style={{ color: '#8b8a9e' }}>Coming Soon...</p>
              </div>
            </div>
            <CardContent className="p-4 text-center">
              <p className="font-semibold text-lg" style={{ color: '#f1f0f5' }}>{video.title}</p>
              <p className="text-xs" style={{ color: '#8b8a9e' }}>{video.language}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
