import { useParams } from 'react-router-dom';
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
  
  return <PortalComponent isDemo={true} />;
}
