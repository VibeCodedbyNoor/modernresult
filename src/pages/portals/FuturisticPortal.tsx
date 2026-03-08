import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps {
  isDemo?: boolean;
  schoolName?: string;
  logoUrl?: string | null;
  onSearch?: (className: string, studentName: string) => Promise<any>;
  demoResult?: any;
}

const FuturisticPortal = ({ isDemo = true, schoolName = "TechEd Institute", logoUrl, onSearch, demoResult }: PortalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentName) { toast.error('Please select a class and enter your name'); return; }
    setLoading(true); setError(''); setResult(null);
    if (isDemo) {
      setTimeout(() => { setResult(generateDemoResult(studentName, selectedClass)); setLoading(false); toast.success('Result loaded successfully!'); }, 1000);
    } else if (onSearch) {
      try {
        const r = await onSearch(selectedClass, studentName);
        if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found.'); }
      } catch { setError('An error occurred.'); } finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      
      <BackButton variant="dark" />
      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-4xl">
        <header className="text-center mb-6 sm:mb-12">
          {logoUrl && <img src={logoUrl} alt={schoolName} className="h-20 w-20 mx-auto mb-4 rounded-full object-cover shadow-lg border-2 border-blue-500/30" />}
          <div className="relative">
            <h1 className="relative text-2xl sm:text-5xl md:text-6xl font-black text-white mb-2 sm:mb-3" style={{ textShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }}>{schoolName}</h1>
          </div>
          <p className="text-blue-400 text-xs sm:text-lg font-semibold">ADVANCED RESULT PORTAL</p>
        </header>

        <div className="relative mb-4 sm:mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl opacity-50 blur"></div>
          <div className="relative bg-slate-800/80 backdrop-blur-sm border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-lg sm:text-2xl font-bold text-blue-400">RESULT QUERY INTERFACE</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-blue-300 mb-1.5 sm:mb-2 flex items-center gap-2"><span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-blue-500 rounded-full"></span>CLASS SELECTION</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-blue-500/30 text-sm sm:text-base text-white rounded-lg focus:outline-none focus:border-blue-500 transition-all" required>
                  <option value="">Select Class Level...</option>
                  {Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-blue-300 mb-1.5 sm:mb-2 flex items-center gap-2"><span className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-blue-500 rounded-full"></span>STUDENT NAME</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border border-blue-500/30 text-sm sm:text-base text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all" placeholder="Enter your name..." required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm sm:text-base text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50">
                {loading ? 'PROCESSING...' : 'INITIATE QUERY'}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="relative mb-4 sm:mb-8">
            <div className="absolute -inset-0.5 bg-red-500 rounded-xl sm:rounded-2xl opacity-50 blur"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-sm border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <p className="text-red-400 text-sm sm:text-base font-semibold text-center">{error}</p>
            </div>
          </div>
        )}

        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl opacity-50 blur"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-blue-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-8">
                <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-blue-500/30">
                  <h3 className="text-base sm:text-xl font-bold text-blue-400 mb-0.5 sm:mb-1">{schoolName}</h3>
                  <p className="text-blue-300/70 text-xs sm:text-sm">RESULT DATA OUTPUT</p>
                </div>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-lg sm:text-2xl text-white font-bold mb-3 sm:mb-4">{result.name || result.student_name}</p>
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-blue-500/30 rounded-lg text-xs sm:text-base text-blue-300">Class: <strong className="text-white">{result.class || result.class_name}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-blue-500/30 rounded-lg text-xs sm:text-base text-blue-300">Position: <strong className="text-white">{result.position || '—'}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-blue-500/30 rounded-lg text-xs sm:text-base text-blue-300">Grade: <strong className="text-blue-400">{result.grade}</strong></span>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-blue-500/20 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0">
                  <table className="w-full text-xs sm:text-base">
                    <thead><tr className="border-b border-blue-500/30"><th className="text-left py-2 sm:py-3 px-1 text-blue-300 font-semibold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-blue-300 font-semibold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-blue-300 font-semibold w-14 sm:w-auto">Total</th></tr></thead>
                    <tbody>
                      {result.subjects?.map((subject: any, idx: number) => (
                        <tr key={idx} className="border-b border-blue-500/10"><td className="py-1.5 sm:py-3 px-1 text-white">{subject.subject || subject.name}</td><td className="text-center py-1.5 sm:py-3 px-1 text-blue-400 font-semibold">{subject.obtained_marks || subject.obtained}</td><td className="text-center py-1.5 sm:py-3 px-1 text-gray-400">{subject.total_marks || subject.total}</td></tr>
                      ))}
                      <tr className="border-t-2 border-blue-500/30"><td className="py-2 sm:py-3 px-1 text-white font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-blue-400 font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td><td className="text-center py-2 sm:py-3 px-1 text-gray-400 font-bold">{result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-white">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p></div>
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-white">{result.grade}</p></div>
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-white leading-tight">{result.remarks || 'Excellent'}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name || result.student_name} schoolName={schoolName} percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage} grade={result.grade} resultRef={resultRef} variant="futuristic" />
          </>
        )}
      </main>
    </div>
  );
};

export default FuturisticPortal;
