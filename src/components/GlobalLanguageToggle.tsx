import LanguageToggle from '@/components/LanguageToggle';

export default function GlobalLanguageToggle() {
  return (
    <div className="fixed top-20 left-4 z-50">
      <LanguageToggle className="bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:bg-accent" />
    </div>
  );
}
