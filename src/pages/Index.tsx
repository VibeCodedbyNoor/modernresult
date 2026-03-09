import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, UserPlus, Building, FileSpreadsheet, CheckCircle, Share2, MessageCircle } from 'lucide-react';
import { resultTemplates } from '@/lib/resultTemplates';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import DesignGrid from '@/components/landing/DesignGrid';
import DoneForYouSection from '@/components/landing/DoneForYouSection';
import CTASection from '@/components/landing/CTASection';

export default function Index() {
  const [showEarn, setShowEarn] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'earn_with_us')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === 'object' && 'enabled' in (data.value as any)) {
          setShowEarn((data.value as any).enabled === true);
        }
      });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1">
          <Link to="/" className="font-display text-sm sm:text-xl font-bold flex-shrink-0" style={{ color: '#a78bfa' }}>
            OnlineResultPortal
          </Link>
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            {showEarn && (
              <Link to="/earn">
                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-[10px] sm:text-sm px-1.5 sm:px-3 h-8">
                  💰 <span className="hidden sm:inline">Earn With Us</span><span className="sm:hidden">Earn</span>
                </Button>
              </Link>
            )}
            <Link to="/terms" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8" style={{ color: '#8b8a9e' }}>
                Terms & Rules
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 text-[10px] sm:text-sm px-1.5 sm:px-3 h-8">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-[10px] sm:text-sm px-2 sm:px-4 h-8" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <DesignGrid />
      <HowItWorks />
      <DoneForYouSection />
      <CTASection />

      {/* Footer */}
      <footer className="py-6 sm:py-8 text-center space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs sm:text-sm" style={{ color: '#6b6a80' }}>
          &copy; {new Date().getFullYear()} OnlineResultPortal. All rights reserved.
        </p>
        <Link to="/terms" className="text-[10px] hover:underline" style={{ color: '#3a3950' }}>
          Terms & Rules
        </Link>
      </footer>
      <WhatsAppHelpButton />
    </div>
  );
}
