import { MessageCircle } from 'lucide-react';

interface PortalBrandingProps {
  variant?: 'neon' | 'light' | 'dark' | 'glass' | 'material' | 'gradient' | 'retro' | 'cyberpunk' | 'kawaii' | 'futuristic' | 'luxury' | 'neumorphism' | 'ocean' | 'nature' | 'islamic' | 'sunset' | 'corporate' | 'pastel' | 'galaxy' | 'royal' | 'monochrome' | 'elegant';
}

const PortalBranding = ({ variant = 'dark' }: PortalBrandingProps) => {
  const styles: Record<string, { badge: string; cta: string }> = {
    neon: { badge: 'bg-black/80 text-cyan-400 border border-cyan-500/50', cta: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' },
    light: { badge: 'bg-white/90 text-gray-800 border border-gray-200 shadow-sm', cta: 'bg-black text-white shadow-lg' },
    dark: { badge: 'bg-gray-900/90 text-gray-100 border border-gray-700', cta: 'bg-blue-600 text-white shadow-lg' },
    glass: { badge: 'backdrop-blur-md bg-white/20 text-white border border-white/30', cta: 'backdrop-blur-md bg-white/30 text-white border border-white/40 shadow-lg' },
    material: { badge: 'bg-indigo-600 text-white shadow-md', cta: 'bg-indigo-600 text-white shadow-lg' },
    gradient: { badge: 'bg-white/90 text-purple-600 shadow-md', cta: 'bg-white text-purple-600 shadow-lg' },
    retro: { badge: 'bg-amber-100 text-amber-900 border-2 border-amber-900', cta: 'bg-amber-700 text-amber-50 border-2 border-amber-900 shadow-lg' },
    cyberpunk: { badge: 'bg-black text-cyan-400 border border-cyan-500', cta: 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30' },
    kawaii: { badge: 'bg-pink-100 text-pink-600 border-2 border-pink-300 rounded-full', cta: 'bg-pink-500 text-white rounded-full shadow-lg' },
    futuristic: { badge: 'bg-slate-900/90 text-blue-400 border border-blue-500/50', cta: 'bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/30' },
    luxury: { badge: 'bg-slate-900/90 text-amber-400 border border-amber-500/50', cta: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30' },
    neumorphism: { badge: 'bg-gray-200 text-gray-700 shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff]', cta: 'bg-gray-200 text-gray-800 shadow-[4px_4px_10px_#bebebe,-4px_-4px_10px_#ffffff]' },
    ocean: { badge: 'bg-blue-900/90 text-cyan-300 border border-cyan-400/50', cta: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' },
    nature: { badge: 'bg-green-900/90 text-green-300 border border-green-400/50', cta: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' },
    islamic: { badge: 'bg-emerald-900/90 text-amber-300 border border-amber-400/50', cta: 'bg-gradient-to-r from-emerald-600 to-amber-500 text-white shadow-lg' },
    sunset: { badge: 'backdrop-blur-md bg-white/20 text-white border border-white/30', cta: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' },
    corporate: { badge: 'bg-white text-slate-700 border border-slate-200 shadow-sm', cta: 'bg-blue-600 text-white shadow-lg' },
    pastel: { badge: 'bg-white/80 text-purple-600 border border-purple-200', cta: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg' },
    galaxy: { badge: 'bg-indigo-950/90 text-purple-300 border border-purple-500/50', cta: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' },
    royal: { badge: 'bg-purple-950/90 text-violet-300 border border-violet-400/50', cta: 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg' },
    monochrome: { badge: 'bg-gray-900/90 text-white border border-gray-700', cta: 'bg-white text-black shadow-lg' },
    elegant: { badge: 'bg-white/90 text-stone-700 border border-stone-200', cta: 'bg-gradient-to-r from-stone-700 to-rose-600 text-white shadow-lg' },
  };

  const currentStyle = styles[variant] || styles.dark;
  const whatsappLink = `https://wa.me/923478312432?text=${encodeURIComponent("Hi! I'm interested in getting a Result Portal for my school.")}`;

  return (
    <>
      <div className={`fixed top-3 right-3 z-50 px-2 py-1 text-[10px] sm:text-xs font-semibold rounded ${currentStyle.badge}`}>
        Powered by <span className="font-bold">RESULTPORTAL</span>
      </div>
      <button
        onClick={() => window.open(whatsappLink, '_blank', 'noopener,noreferrer')}
        className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${currentStyle.cta}`}
        style={{ zIndex: 2147483647 }}
      >
        <MessageCircle className="w-4 h-4" />
        <span>Get Portal</span>
      </button>
    </>
  );
};

export default PortalBranding;