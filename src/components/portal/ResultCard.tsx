import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { NeonButton } from '@/components/ui/neon-button';
import { toast } from '@/hooks/use-toast';
import DownloadResultCard from './DownloadResultCard';
import { Share2 } from 'lucide-react';

interface ResultCardProps {
  resultData: any;
}

const ResultCard = ({ resultData }: ResultCardProps) => {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [downloadCardElement, setDownloadCardElement] = useState<HTMLDivElement | null>(null);

  const studentName = resultData.name || '';
  const className = resultData.class || '';
  const position = resultData.position || '';
  const obtainedTotal = resultData.total_obtained || 0;
  const percentage = resultData.percentage || '0%';
  const grade = resultData.grade || 'F';
  const remarks = resultData.remarks || '';
  const subjects = resultData.subjects || [];

  const totalMarks = subjects.reduce((sum: number, s: any) => sum + s.total_marks, 0);

  const generateImage = async () => {
    if (!downloadCardElement) return null;

    try {
      const canvas = await html2canvas(downloadCardElement, {
        backgroundColor: '#1a1a2e',
        scale: 4,
        useCORS: true,
        logging: false,
      });

      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    toast({
      title: '📸 Generating high-quality image...',
      description: 'Please wait a moment',
      duration: 1500,
    });

    const imageData = await generateImage();

    if (!imageData) {
      toast({
        variant: 'destructive',
        title: '❌ Download Failed',
        description: 'Please try again',
        duration: 2000,
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `Result_${studentName.replace(/\s+/g, '_')}_${className}.png`;
    link.href = imageData;
    link.click();

    toast({
      title: '✅ Download Ready',
      description: 'Your result card has been saved successfully!',
      duration: 2000,
    });
  };

  const handleShare = async () => {
    toast({
      title: '📸 Generating shareable image...',
      description: 'Please wait a moment',
      duration: 1500,
    });

    const imageData = await generateImage();

    if (!imageData) {
      toast({
        variant: 'destructive',
        title: '❌ Share Failed',
        description: 'Please try again',
        duration: 2000,
      });
      return;
    }

    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], `Result_${studentName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

    const shareText = `Check out my result! 🦅\n\n📊 Percentage: ${percentage}\n🏆 Grade: ${grade}`;

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'My Result Card',
          text: shareText,
          files: [file],
        });
        toast({
          title: '✅ Shared Successfully',
          description: 'Result card has been shared!',
          duration: 2000,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(imageData, shareText);
        }
      }
    } else {
      fallbackShare(imageData, shareText);
    }
  };

  const fallbackShare = (imageData: string, text: string) => {
    // Download and copy text
    const link = document.createElement('a');
    link.download = `Result_${studentName.replace(/\s+/g, '_')}_${className}.png`;
    link.href = imageData;
    link.click();

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: '✅ Image Downloaded & Text Copied',
        description: 'Paste the text when sharing on social media!',
        duration: 2500,
      });
    });
  };

  return (
    <>
      <DownloadResultCard resultData={resultData} onCapture={setDownloadCardElement} />

      <div className="max-w-4xl mx-auto space-y-4">
      <div ref={resultCardRef} className="glass-card rounded-xl p-3 sm:p-6 animate-fade-in neon-border-blue">
        <div className="text-center mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-orbitron font-bold gradient-text mb-2">
            Student Result Card
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-8 text-sm sm:text-base text-foreground/80 mb-2 sm:mb-4">
            <p><span className="text-neon-cyan">Name:</span> {studentName}</p>
            <p><span className="text-neon-cyan">Class:</span> {className}</p>
            <p><span className="text-neon-pink">Position:</span> {position} 🏆</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-3 sm:mb-4 -mx-3 sm:mx-0 px-3 sm:px-0">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b-2 border-neon-blue">
                <th className="text-left py-2 px-2 sm:px-4 font-orbitron text-neon-blue">Subject</th>
                <th className="text-center py-2 px-1 sm:px-4 font-orbitron text-neon-purple w-16 sm:w-auto">Total</th>
                <th className="text-center py-2 px-1 sm:px-4 font-orbitron text-neon-pink w-16 sm:w-auto">Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject: any, index: number) => (
                <tr
                  key={index}
                  className="border-b border-border/30"
                >
                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 font-medium">{subject.subject}</td>
                  <td className="text-center py-1.5 sm:py-2 px-1 sm:px-4 text-muted-foreground">{subject.total_marks}</td>
                  <td className="text-center py-1.5 sm:py-2 px-1 sm:px-4 font-semibold text-primary">{subject.obtained_marks}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-neon-purple bg-card/50">
                <td className="py-2 px-2 sm:px-4 font-orbitron font-bold text-neon-cyan text-xs sm:text-sm">TOTAL</td>
                <td className="text-center py-2 px-1 sm:px-4 font-bold text-neon-purple">{totalMarks}</td>
                <td className="text-center py-2 px-1 sm:px-4 font-bold text-neon-pink">{obtainedTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="glass-card rounded-lg p-2 sm:p-3 text-center neon-border-purple">
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Percentage</div>
            <div className="text-sm sm:text-xl font-orbitron font-bold text-neon-purple">{percentage}</div>
          </div>
          <div className="glass-card rounded-lg p-2 sm:p-3 text-center neon-border-blue">
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Grade</div>
            <div className="text-sm sm:text-xl font-orbitron font-bold text-neon-blue">{grade}</div>
          </div>
          <div className="glass-card rounded-lg p-2 sm:p-3 text-center neon-border-cyan">
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Remarks</div>
            <div className="text-xs sm:text-lg font-orbitron font-bold text-neon-cyan truncate">{remarks}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 sm:gap-4">
        <NeonButton
          onClick={handleDownload}
          variant="purple"
          className="group text-xs sm:text-base h-8 sm:h-10 px-3 sm:px-6"
        >
          <span className="hidden sm:inline">Download Result Card</span>
          <span className="sm:hidden">Download</span>
          <span className="text-base sm:text-xl">📸</span>
        </NeonButton>

        <NeonButton
          onClick={handleShare}
          variant="pink"
          className="group text-xs sm:text-base h-8 sm:h-10 px-3 sm:px-6"
        >
          <span>Share</span>
          <Share2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </NeonButton>
      </div>
    </div>
    </>
  );
};

export default ResultCard;