import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { Heart } from 'lucide-react';
import PortalBranding from '@/components/portal/PortalBranding';
import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps {
  isDemo?: boolean;
  schoolName?: string;
  logoUrl?: string | null;
  onSearch?: (className: string, studentName: string) => Promise<any>;
  demoResult?: any;
}

const KawaiiPortal = ({ isDemo = true, schoolName = "Little Stars Academy", logoUrl, onSearch, demoResult }: PortalProps) => {
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
      try { const r = await onSearch(selectedClass, studentName); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); } } catch { setError('Search failed'); } finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      <PortalBranding variant="kawaii" />
      <BackButton variant="kawaii" />
      <div className="absolute top-20 left-10 w-40 h-20 bg-white rounded-full opacity-70 shadow-lg hidden sm:block"></div>
      <div className="absolute top-40 right-20 w-32 h-16 bg-white rounded-full opacity-70 shadow-lg hidden sm:block"></div>

      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-2 sm:border-4 border-pink-300">
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover border-2 border-pink-300" />}
            <h1 className="text-2xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-2 sm:mb-3">
              {schoolName} ✨
            </h1>
            <p className="text-sm sm:text-xl text-pink-500 font-semibold">Kawaii Result Portal ♡</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border-2 sm:border-4 border-purple-300 mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-purple-600 mb-4 sm:mb-6 text-center flex items-center justify-center gap-2">
            <span>Check Your Result</span>
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 fill-pink-500" />
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-700 mb-1.5 sm:mb-2 flex items-center gap-1"><span>🌸</span> Select Class</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 sm:border-3 border-pink-300 bg-pink-50 text-sm sm:text-base text-purple-800 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-semibold" required>
                <option value="">Choose your class ♡</option>
                {Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-700 mb-1.5 sm:mb-2 flex items-center gap-1"><span>🌟</span> Student Name</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 sm:border-3 border-pink-300 bg-pink-50 text-sm sm:text-base text-purple-800 rounded-xl sm:rounded-2xl placeholder-purple-400 focus:outline-none focus:border-purple-400 transition-all font-semibold" placeholder="Enter your name..." required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-sm sm:text-lg text-white font-black rounded-xl sm:rounded-2xl transition-all shadow-lg disabled:opacity-50">
              {loading ? '✨ Loading...' : '💖 CHECK RESULT ✨'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border-2 sm:border-4 border-red-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
            <p className="text-red-700 text-center text-sm sm:text-base font-bold flex items-center justify-center gap-2"><span>😢</span> {error}</p>
          </div>
        )}

        {result && !error && (
          <>
            <div ref={resultRef} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-2xl border-2 sm:border-4 border-pink-300">
              <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-pink-200">
                <h3 className="text-base sm:text-xl font-bold text-purple-600 mb-0.5 sm:mb-1">🌟 {schoolName} 🌟</h3>
              </div>
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-lg sm:text-2xl text-purple-700 font-bold mb-3 sm:mb-4">✨ {result.name} ✨</p>
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-100 border-2 border-pink-300 rounded-full text-xs sm:text-base text-pink-700 font-semibold">Class: {result.class}</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 border-2 border-purple-300 rounded-full text-xs sm:text-base text-purple-700 font-semibold">Position: {result.position} ⭐</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 border-2 border-blue-300 rounded-full text-xs sm:text-base text-blue-700 font-semibold">Grade: {result.grade}</span>
                </div>
              </div>
              <div className="bg-pink-50 border-2 border-pink-200 rounded-xl sm:rounded-2xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0">
                <table className="w-full text-xs sm:text-base">
                  <thead><tr className="border-b-2 border-pink-300"><th className="text-left py-2 sm:py-3 px-1 text-purple-700 font-bold">📚 Subject</th><th className="text-center py-2 sm:py-3 px-1 text-pink-600 font-bold w-14 sm:w-auto">✅ Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-purple-600 font-bold w-14 sm:w-auto">📊 Total</th></tr></thead>
                  <tbody>
                    {result.subjects?.map((subject: any, idx: number) => (
                      <tr key={idx} className="border-b border-pink-200"><td className="py-1.5 sm:py-2 px-1 text-purple-800 font-medium">{subject.subject}</td><td className="text-center py-1.5 sm:py-2 px-1 text-pink-600 font-bold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-2 px-1 text-purple-500">{subject.total_marks}</td></tr>
                    ))}
                    <tr className="border-t-2 border-purple-300 bg-purple-50"><td className="py-2 px-1 text-purple-700 font-bold">🎯 TOTAL</td><td className="text-center py-2 px-1 text-pink-600 font-bold">{result.total_obtained}</td><td className="text-center py-2 px-1 text-purple-500 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">⭐ Percentage</p><p className="text-sm sm:text-2xl font-bold text-white">{result.percentage}</p></div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">🏆 Grade</p><p className="text-sm sm:text-2xl font-bold text-white">{result.grade}</p></div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">💖 Remarks</p><p className="text-[10px] sm:text-sm font-bold text-white leading-tight">{result.remarks}</p></div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="kawaii" />
          </>
        )}
      </main>
    </div>
  );
};

export default KawaiiPortal;
