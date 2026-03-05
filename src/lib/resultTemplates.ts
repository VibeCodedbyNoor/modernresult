export interface ResultTemplate {
  id: string;
  name: string;
  description: string;
  // Preview colors for thumbnail
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  // Actual template styles
  background: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
  buttonGradient: string;
  inputBg: string;
  tableHeaderBg: string;
  fontClass?: string;
  borderRadius?: string;
  decorations?: 'sparkles' | 'geometric' | 'waves' | 'none';
}

export const resultTemplates: ResultTemplate[] = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Royal dark theme with golden accents',
    previewBg: '#0f172a',
    previewCard: '#1e293b',
    previewAccent: '#d4a017',
    background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)',
    cardBg: 'rgba(30, 41, 59, 0.8)',
    cardBorder: 'rgba(212, 160, 23, 0.2)',
    accentColor: '#d4a017',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    buttonGradient: 'linear-gradient(90deg, #d4a017, #b8860b)',
    inputBg: 'rgba(15, 23, 42, 0.7)',
    tableHeaderBg: 'rgba(212, 160, 23, 0.08)',
    borderRadius: '0.75rem',
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Clean dark with electric blue accent',
    previewBg: '#111827',
    previewCard: '#1f2937',
    previewAccent: '#3b82f6',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
    cardBg: 'rgba(31, 41, 55, 0.85)',
    cardBorder: 'rgba(59, 130, 246, 0.2)',
    accentColor: '#3b82f6',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    buttonGradient: 'linear-gradient(90deg, #3b82f6, #2563eb)',
    inputBg: 'rgba(17, 24, 39, 0.7)',
    tableHeaderBg: 'rgba(59, 130, 246, 0.08)',
    borderRadius: '0.5rem',
  },
  {
    id: 'kawaii',
    name: 'Kawaii',
    description: 'Pastel pink & purple, playful feel',
    previewBg: '#fdf2f8',
    previewCard: '#ffffff',
    previewAccent: '#ec4899',
    background: 'linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #eff6ff 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(236, 72, 153, 0.25)',
    accentColor: '#ec4899',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    buttonGradient: 'linear-gradient(90deg, #ec4899, #a855f7)',
    inputBg: 'rgba(253, 242, 248, 0.7)',
    tableHeaderBg: 'rgba(236, 72, 153, 0.06)',
    borderRadius: '1rem',
    decorations: 'sparkles',
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    description: 'Dark blue with neon purple accents',
    previewBg: '#0a0a1a',
    previewCard: '#141428',
    previewAccent: '#a855f7',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)',
    cardBg: 'rgba(20, 20, 40, 0.85)',
    cardBorder: 'rgba(168, 85, 247, 0.3)',
    accentColor: '#a855f7',
    textPrimary: '#e2e8f0',
    textSecondary: '#7c85a0',
    buttonGradient: 'linear-gradient(90deg, #a855f7, #6366f1)',
    inputBg: 'rgba(10, 10, 26, 0.7)',
    tableHeaderBg: 'rgba(168, 85, 247, 0.08)',
    borderRadius: '0.5rem',
    decorations: 'geometric',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass cards with gradient bg',
    previewBg: '#667eea',
    previewCard: 'rgba(255,255,255,0.2)',
    previewAccent: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    cardBorder: 'rgba(255, 255, 255, 0.25)',
    accentColor: '#ffffff',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    buttonGradient: 'linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))',
    inputBg: 'rgba(255, 255, 255, 0.1)',
    tableHeaderBg: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '1rem',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean white with subtle borders',
    previewBg: '#ffffff',
    previewCard: '#ffffff',
    previewAccent: '#111827',
    background: '#fafafa',
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    accentColor: '#111827',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    buttonGradient: 'linear-gradient(90deg, #111827, #374151)',
    inputBg: '#f9fafb',
    tableHeaderBg: '#f3f4f6',
    borderRadius: '0.375rem',
  },
  {
    id: 'islamic',
    name: 'Islamic',
    description: 'Elegant green and gold patterns',
    previewBg: '#064e3b',
    previewCard: '#065f46',
    previewAccent: '#d4a017',
    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    cardBg: 'rgba(6, 95, 70, 0.6)',
    cardBorder: 'rgba(212, 160, 23, 0.3)',
    accentColor: '#d4a017',
    textPrimary: '#ecfdf5',
    textSecondary: '#86efac',
    buttonGradient: 'linear-gradient(90deg, #d4a017, #b8860b)',
    inputBg: 'rgba(6, 78, 59, 0.5)',
    tableHeaderBg: 'rgba(212, 160, 23, 0.1)',
    borderRadius: '0.75rem',
    decorations: 'geometric',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    description: 'Dark with bright neon glow effects',
    previewBg: '#0a0a0a',
    previewCard: '#141414',
    previewAccent: '#00ff88',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #0d1117 100%)',
    cardBg: 'rgba(20, 20, 20, 0.9)',
    cardBorder: 'rgba(0, 255, 136, 0.3)',
    accentColor: '#00ff88',
    textPrimary: '#e4e4e7',
    textSecondary: '#71717a',
    buttonGradient: 'linear-gradient(90deg, #00ff88, #00cc6a)',
    inputBg: 'rgba(10, 10, 10, 0.8)',
    tableHeaderBg: 'rgba(0, 255, 136, 0.06)',
    borderRadius: '0.5rem',
  },
];

export function getTemplate(id: string): ResultTemplate {
  return resultTemplates.find((t) => t.id === id) || resultTemplates[0];
}
