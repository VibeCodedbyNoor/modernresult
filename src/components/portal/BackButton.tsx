import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackButtonProps {
  variant?: 'light' | 'dark' | 'neon' | 'glass' | 'material' | 'gradient' | 'brutalist' | 'retro' | 'cyberpunk' | 'kawaii' | 'futuristic' | 'luxury' | 'neumorphism' | 'ocean' | 'nature' | 'islamic' | 'sunset' | 'corporate' | 'pastel' | 'galaxy' | 'royal' | 'monochrome' | 'elegant';
}

const BackButton = ({ variant = 'dark' }: BackButtonProps) => {
  const styles: Record<string, string> = {
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200',
    dark: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
    neon: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/50',
    glass: 'backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border-white/30',
    material: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500',
    gradient: 'bg-white/90 hover:bg-white text-purple-600 border-white/50',
    brutalist: 'bg-black hover:bg-gray-900 text-yellow-400 border-4 border-black',
    retro: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-900',
    cyberpunk: 'bg-black hover:bg-gray-900 text-cyan-400 border border-cyan-500',
    kawaii: 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-2 border-pink-300',
    futuristic: 'bg-slate-900/80 hover:bg-slate-800 text-blue-400 border border-blue-500/50',
    luxury: 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/50',
    neumorphism: 'bg-[#e0e5ec] text-gray-700 border-0 shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff]',
    ocean: 'bg-blue-900/80 hover:bg-blue-800 text-cyan-300 border border-cyan-400/50',
    nature: 'bg-green-900/80 hover:bg-green-800 text-green-300 border border-green-400/50',
    islamic: 'bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-amber-400/50',
    sunset: 'backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border-white/30',
    corporate: 'bg-white hover:bg-gray-50 text-slate-700 border border-slate-200',
    pastel: 'bg-white/80 hover:bg-white text-purple-600 border border-purple-200',
    galaxy: 'bg-indigo-950/80 hover:bg-indigo-900 text-purple-300 border border-purple-500/50',
    royal: 'bg-purple-950/80 hover:bg-purple-900 text-violet-300 border border-violet-400/50',
    monochrome: 'bg-gray-900/80 hover:bg-gray-800 text-white border border-gray-700',
    elegant: 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200',
  };

  return (
    <Link to="/" className={`fixed top-3 left-3 z-50 flex items-center gap-1 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full font-semibold text-[10px] sm:text-sm border backdrop-blur-sm transition-all hover:scale-105 ${styles[variant]}`}>
      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Back to Designs</span>
      <span className="sm:hidden">Back</span>
    </Link>
  );
};

export default BackButton;