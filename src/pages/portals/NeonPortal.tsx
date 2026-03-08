import { useState } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import ResultCard from '@/components/portal/ResultCard';
import { NeonInput } from '@/components/ui/neon-input';
import { NeonSelect } from '@/components/ui/neon-select';
import { NeonButton } from '@/components/ui/neon-button';

import BackButton from '@/components/portal/BackButton';

interface PortalProps { isDemo?: boolean; schoolName?: string; logoUrl?: string | null; onSearch?: (className: string, studentName: string) => Promise<any>; demoResult?: any; }

const NeonPortal = ({ isDemo = true, schoolName = "SHAHEEN PUBLIC HIGH SCHOOL", logoUrl, onSearch, demoResult }: PortalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentName) { toast.error('Please select a class and enter your name'); return; }
    setLoading(true); setError(''); setResult(null); setProgress(0);

    if (isDemo) {
      const progressInterval = setInterval(() => { setProgress(prev => { if (prev >= 90) { clearInterval(progressInterval); return prev; } return prev + 10; }); }, 200);
      setTimeout(() => { setProgress(100); setResult(generateDemoResult(studentName, selectedClass)); clearInterval(progressInterval); setLoading(false); toast.success('Result loaded successfully!'); setTimeout(() => setProgress(0), 1000); }, 2000);
    } else if (onSearch) {
      try { const r = await onSearch(selectedClass, studentName); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); } } catch { setError('Search failed'); } finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      <BackButton variant="neon" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.15),transparent_50%)] animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,255,0.15),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,128,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] animate-pulse"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, opacity: 0.5 }} />))}
      </div>

      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-8 pb-20 relative z-10">
        <header className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-block mb-4 sm:mb-6">
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover border-2 border-cyan-500/50" />}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]" style={{ animation: 'pulse 2s infinite' }}>{schoolName}</h1>
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 mt-2 shadow-[0_0_20px_rgba(0,255,255,0.8)]" style={{ animation: 'pulse 2s infinite' }}></div>
          </div>
          <p className="text-cyan-400 text-xl tracking-widest font-mono drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">RESULT PORTAL</p>
        </header>

        <div className="max-w-md mx-auto mb-12 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-black/50 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)] hover:shadow-[0_0_80px_rgba(0,255,255,0.4)] transition-shadow duration-500">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">CHECK RESULT</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div><label className="block text-cyan-300 mb-2 font-mono text-sm tracking-wider">SELECT CLASS</label><NeonSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required><option value="">Choose your class</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</NeonSelect></div>
              <div><label className="block text-cyan-300 mb-2 font-mono text-sm tracking-wider">STUDENT NAME</label><NeonInput type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" required /></div>
              {loading && (<div className="space-y-2"><div className="flex justify-between text-cyan-400 text-sm font-mono"><span>Loading...</span><span>{progress}%</span></div><div className="h-2 bg-black/50 rounded-full border border-cyan-500/50 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.8)]" style={{ width: `${progress}%` }}></div></div></div>)}
              <NeonButton type="submit" disabled={loading}>{loading ? 'LOADING...' : 'CHECK RESULT'}</NeonButton>
            </form>
          </div>
        </div>

        {error && (<div className="max-w-2xl mx-auto mb-8 p-4 border-2 border-pink-500 bg-pink-500/10 rounded-lg backdrop-blur-sm animate-fade-in"><p className="text-pink-400 text-center font-mono">{error}</p></div>)}
        {result && !error && (<div className="max-w-2xl mx-auto animate-scale-in"><ResultCard resultData={result} /></div>)}
      </main>
    </div>
  );
};

export default NeonPortal;
