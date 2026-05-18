import { useParams, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';
import CorporatePortal from './portals/CorporatePortal';
import CyberPunkPortal from './portals/CyberPunkPortal';
import DarkModePortal from './portals/DarkModePortal';
import ElegantPortal from './portals/ElegantPortal';
import FuturisticPortal from './portals/FuturisticPortal';
import GalaxyPortal from './portals/GalaxyPortal';
import GlassmorphismPortal from './portals/GlassmorphismPortal';
import GradientModernPortal from './portals/GradientModernPortal';
import IslamicPortal from './portals/IslamicPortal';
import KawaiiPortal from './portals/KawaiiPortal';
import LuxuryGoldPortal from './portals/LuxuryGoldPortal';
import MaterialDesignPortal from './portals/MaterialDesignPortal';
import MinimalistPortal from './portals/MinimalistPortal';
import MonochromePortal from './portals/MonochromePortal';
import NaturePortal from './portals/NaturePortal';
import NeonPortal from './portals/NeonPortal';
import NeumorphismPortal from './portals/NeumorphismPortal';
import OceanPortal from './portals/OceanPortal';
import PastelPortal from './portals/PastelPortal';
import RetroPortal from './portals/RetroPortal';
import RoyalPurplePortal from './portals/RoyalPurplePortal';
import SunsetPortal from './portals/SunsetPortal';

const PORTAL_MAP: Record<string, React.ComponentType<any>> = {
  'corporate': CorporatePortal,
  'cyberpunk': CyberPunkPortal,
  'dark-mode': DarkModePortal,
  'elegant': ElegantPortal,
  'futuristic': FuturisticPortal,
  'galaxy': GalaxyPortal,
  'glassmorphism': GlassmorphismPortal,
  'gradient-modern': GradientModernPortal,
  'islamic': IslamicPortal,
  'kawaii': KawaiiPortal,
  'luxury-gold': LuxuryGoldPortal,
  'material-design': MaterialDesignPortal,
  'minimalist': MinimalistPortal,
  'monochrome': MonochromePortal,
  'nature': NaturePortal,
  'neon': NeonPortal,
  'neumorphism': NeumorphismPortal,
  'ocean': OceanPortal,
  'pastel': PastelPortal,
  'retro': RetroPortal,
  'royal-purple': RoyalPurplePortal,
  'sunset': SunsetPortal,
};

export default function DemoPortal() {
  const { templateId } = useParams<{ templateId: string }>();
  const PortalComponent = PORTAL_MAP[templateId || 'luxury-gold'] || LuxuryGoldPortal;
  const niceName = (templateId || 'luxury-gold').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="relative">
      <SEO
        title={`${niceName} Result Portal Design — Live Demo`}
        description={`Preview the ${niceName} result portal design from ResultPortal.online. See how student exam results look with this template before signing up.`}
        path={`/demo/${templateId || 'luxury-gold'}`}
      />
      {/* Floating Get This Design Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
        <div
          className="mx-auto max-w-xl mb-4 sm:mb-6 mx-4"
          style={{
            background: 'linear-gradient(135deg, rgba(109,40,217,0.95), rgba(167,139,250,0.95))',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(109,40,217,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 text-white font-semibold text-sm sm:text-base no-underline hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Get This Design — Sign Up Free
          </Link>
        </div>
      </div>

      <PortalComponent isDemo={true} />
    </div>
  );
}
