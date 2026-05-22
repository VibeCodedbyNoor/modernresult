import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-agent`;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm **Noor** 👋\n\nAsk me anything in any language — English, اردو, Roman Urdu, پښتو, हिन्दी…" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble right now. WhatsApp +923478312432 for quick help." }]);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let added = false;
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              if (!added) {
                setMessages(m => [...m, { role: 'assistant', content: assistantText }]);
                added = true;
              } else {
                setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: assistantText } : msg));
              }
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Connection issue. Try WhatsApp +923478312432." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
        className="fixed bottom-5 left-5 z-[60] group"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/50 flex items-center justify-center text-white border-2 border-white/20 hover:scale-110 transition-transform">
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </div>
          {!open && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </div>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-2 right-2 sm:left-5 sm:right-auto z-[60] sm:w-[92vw] sm:max-w-sm h-[75vh] max-h-[600px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold">N</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Noor</div>
              <div className="text-xs opacity-90 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" /> Online · Any language
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-muted/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-background border border-border rounded-bl-md'
                }`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-0">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border px-3.5 py-2.5 rounded-2xl rounded-bl-md flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-border bg-background flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything in any language..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="icon" onClick={send} disabled={loading || !input.trim()} className="rounded-full h-9 w-9">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
