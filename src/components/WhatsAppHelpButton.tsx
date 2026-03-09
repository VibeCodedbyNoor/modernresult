import { MessageCircle } from 'lucide-react';

export default function WhatsAppHelpButton() {
  const whatsappUrl = `https://wa.me/923479104843?text=${encodeURIComponent('Assalam o Alaikum! I need help with OnlineResultPortal.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 shadow-lg transition-all hover:scale-105 group"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium hidden sm:inline group-hover:inline">Need any help?</span>
    </a>
  );
}
