import { useState } from 'react';
import html2canvas from 'html2canvas';
import { toast } from '@/hooks/use-toast';
import { Download, Share2 } from 'lucide-react';

interface ResultActionsProps {
  studentName: string;
  schoolName: string;
  percentage: string;
  grade: string;
  resultRef: React.RefObject<HTMLDivElement>;
  variant?: 'neon' | 'light' | 'dark' | 'glass' | 'material' | 'gradient' | 'brutalist' | 'retro' | 'cyberpunk' | 'kawaii' | 'futuristic' | 'luxury' | 'ocean' | 'nature' | 'islamic' | 'sunset' | 'corporate' | 'pastel' | 'galaxy' | 'royal' | 'monochrome' | 'elegant';
}

const variantStyles: Record<string, { download: string; share: string }> = {
  neon: { download: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]', share: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)]' },
  light: { download: 'bg-black hover:bg-gray-800 text-white', share: 'border-2 border-black text-black hover:bg-black hover:text-white' },
  dark: { download: 'bg-blue-600 hover:bg-blue-700 text-white', share: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' },
  glass: { download: 'backdrop-blur-md bg-white/30 hover:bg-white/40 border border-white/40 text-white', share: 'backdrop-blur-md bg-white/20 hover:bg-white/30 border border-white/30 text-white' },
  material: { download: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg', share: 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-lg' },
  gradient: { download: 'bg-white text-purple-600 hover:bg-gray-100 shadow-lg', share: 'backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white border border-white/30' },
  brutalist: { download: 'bg-black text-white border-4 border-black hover:bg-yellow-400 hover:text-black', share: 'bg-white text-black border-4 border-black hover:bg-black hover:text-white' },
  retro: { download: 'bg-amber-700 hover:bg-amber-800 text-amber-50 border-2 border-amber-900', share: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-900' },
  cyberpunk: { download: 'bg-cyan-500 hover:bg-cyan-400 text-black', share: 'bg-pink-500 hover:bg-pink-400 text-black' },
  kawaii: { download: 'bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg', share: 'bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg' },
  futuristic: { download: 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400', share: 'bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500' },
  luxury: { download: 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black', share: 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/50' },
  ocean: { download: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white', share: 'bg-blue-900 hover:bg-blue-800 text-cyan-300 border border-cyan-400/50' },
  nature: { download: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white', share: 'bg-green-900 hover:bg-green-800 text-green-300 border border-green-400/50' },
  islamic: { download: 'bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white', share: 'bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-amber-400/50' },
  sunset: { download: 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white', share: 'backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border border-white/30' },
  corporate: { download: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg', share: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' },
  pastel: { download: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white', share: 'bg-white/80 hover:bg-white text-purple-600 border border-purple-200' },
  galaxy: { download: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white', share: 'bg-indigo-900 hover:bg-indigo-800 text-purple-300 border border-purple-500/50' },
  royal: { download: 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white', share: 'bg-purple-900 hover:bg-purple-800 text-violet-300 border border-violet-400/50' },
  monochrome: { download: 'bg-white hover:bg-gray-100 text-black', share: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' },
  elegant: { download: 'bg-gradient-to-r from-stone-700 to-rose-600 hover:from-stone-800 hover:to-rose-700 text-white', share: 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200' },
};

const ResultActions = ({ studentName, schoolName, percentage, grade, resultRef, variant = 'dark' }: ResultActionsProps) => {
  const [downloading, setDownloading] = useState(false);

  const generateImage = async () => {
    if (!resultRef.current) return null;
    try {
      const canvas = await html2canvas(resultRef.current, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    toast({ title: '📸 Generating image...', description: 'Please wait a moment', duration: 1500 });
    const imageData = await generateImage();
    if (!imageData) {
      toast({ variant: 'destructive', title: '❌ Download Failed', description: 'Please try again', duration: 2000 });
      setDownloading(false);
      return;
    }
    const link = document.createElement('a');
    link.download = `Result_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = imageData;
    link.click();
    toast({ title: '✅ Downloaded!', description: 'Your result card has been saved', duration: 2000 });
    setDownloading(false);
  };

  const handleShare = async () => {
    toast({ title: '📸 Preparing to share...', description: 'Please wait a moment', duration: 1500 });
    const imageData = await generateImage();
    if (!imageData) {
      toast({ variant: 'destructive', title: '❌ Share Failed', description: 'Please try again', duration: 2000 });
      return;
    }
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], `Result_${studentName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
    const shareText = `Check out my result from ${schoolName}!\n\n📊 Percentage: ${percentage}\n🏆 Grade: ${grade}\n\n#ResultPortal`;
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: 'My Result Card', text: shareText, files: [file] });
        toast({ title: '✅ Shared!', description: 'Result card has been shared', duration: 2000 });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') fallbackShare(imageData, shareText);
      }
    } else {
      fallbackShare(imageData, shareText);
    }
  };

  const fallbackShare = (imageData: string, text: string) => {
    const link = document.createElement('a');
    link.download = `Result_${studentName.replace(/\s+/g, '_')}.png`;
    link.href = imageData;
    link.click();
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: '✅ Image Downloaded & Text Copied', description: 'Paste the text when sharing on social media!', duration: 2500 });
    });
  };

  const styles = variantStyles[variant] || variantStyles.dark;

  return (
    <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
      <button onClick={handleDownload} disabled={downloading} className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 ${styles.download}`}>
        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Download Result</span>
        <span className="sm:hidden">Download</span>
      </button>
      <button onClick={handleShare} className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-semibold rounded-lg transition-all duration-300 active:scale-95 ${styles.share}`}>
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Share</span>
      </button>
    </div>
  );
};

export default ResultActions;