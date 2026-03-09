import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 gap-1.5 text-xs px-2 ${className}`}
      onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === 'en' ? 'اردو' : 'EN'}
    </Button>
  );
}
