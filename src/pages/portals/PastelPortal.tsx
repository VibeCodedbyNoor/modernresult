import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { Flower2 } from 'lucide-react';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps { isDemo?: boolean; schoolName?: string; logoUrl?: string | null; onSearch?: (className: string, studentName: string) => Promise<any>; demoResult?: any; }

const PastelPortal = ({ isDemo = true, schoolName = "Rainbow Dreams School", logoUrl, onSearch, demoResult }: PortalProps) => {
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
    if (isDemo) { setTimeout(() => { setResult(generateDemoResult(studentName, selectedClass)); setLoading(false); toast.success('Result loaded successfully!'); }, 1000); }
    else if (onSearch) { try { const r = await onSearch(selectedClass, studentName); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); } } catch { setError('Search failed'); } finally { setLoading(false); } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-20 left-20 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-40"></div><div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-40"></div><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30"></div></div>
      <PortalBranding variant="pastel" />
      <BackButton variant="pastel" />
      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-6 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className="relative inline-block mb-3 sm:mb-6">
            <Flower2 className="absolute -top-1 sm:-top-4 -left-1 sm:-left-4 w-4 h-4 sm:w-8 sm:h-8 text-pink-400" />
            <Flower2 className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-4 h-4 sm:w-8 sm:h-8 text-purple-400" />
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover border-2 border-purple-200" />}
            <h1 className="relative text-xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 px-6 sm:px-0">{schoolName}</h1>
          </div>
          <div className="w-20 sm:w-32 h-0.5 sm:h-1 mx-auto bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 mb-2 sm:mb-4"></div>
          <p className="text-pink-500/70 text-[10px] sm:text-lg italic">Where Every Dream Takes Flight</p>
        </header>

        <div className="relative mb-4 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border sm:border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
            <div className="text-center mb-4 sm:mb-6"><h2 className="text-xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">Student Result Inquiry</h2><div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300"></div></div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div><label className="block text-xs sm:text-sm font-semibold text-purple-600 mb-2 sm:mb-3">Class Selection</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/60 border sm:border-2 border-purple-200 text-sm sm:text-base text-purple-800 rounded-lg sm:rounded-xl focus:outline-none focus:border-purple-400 transition-all shadow-sm" required><option value="">Select Your Class...</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
              <div><label className="block text-xs sm:text-sm font-semibold text-purple-600 mb-2 sm:mb-3">Student Name</label><input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/60 border sm:border-2 border-purple-200 text-sm sm:text-base text-purple-800 rounded-lg sm:rounded-xl placeholder-purple-300 focus:outline-none focus:border-purple-400 transition-all shadow-sm" placeholder="Enter Your Name..." required /></div>
              <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-sm sm:text-lg text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50"><span className="flex items-center justify-center gap-2">{loading ? 'Processing...' : <><Flower2 className="w-4 h-4 sm:w-5 sm:h-5" /> View Result</>}</span></button>
            </form>
          </div>
        </div>

        {error && (<div className="relative mb-4 sm:mb-8"><div className="absolute -inset-1 bg-red-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div><div className="relative bg-white/80 backdrop-blur-sm border sm:border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"><p className="text-red-500 text-center text-sm sm:text-base">{error}</p></div></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border sm:border-2 border-purple-200 rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-xl">
                <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-purple-200"><h3 className="text-base sm:text-xl font-bold text-purple-600 mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-pink-500/70 text-xs sm:text-sm italic">Academic Excellence Report</p></div>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-lg sm:text-2xl text-purple-800 font-bold mb-3 sm:mb-4">{result.name}</p>
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-50 border border-pink-200 rounded-full text-xs sm:text-base text-pink-600">Class: <strong className="text-pink-700">{result.class}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-50 border border-purple-200 rounded-full text-xs sm:text-base text-purple-600">Position: <strong className="text-purple-700">{result.position}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-xs sm:text-base text-blue-600">Grade: <strong className="text-blue-700">{result.grade}</strong></span>
                  </div>
                </div>
                <div className="bg-white/60 border border-purple-100 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0">
                  <table className="w-full text-xs sm:text-base">
                    <thead><tr className="border-b-2 border-purple-200"><th className="text-left py-2 sm:py-3 px-1 text-purple-600 font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-purple-600 font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-purple-600 font-bold w-14 sm:w-auto">Total</th></tr></thead>
                    <tbody>
                      {result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-purple-100"><td className="py-1.5 sm:py-3 px-1 text-purple-800">{subject.subject}</td><td className="text-center py-1.5 sm:py-3 px-1 text-pink-500 font-semibold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-3 px-1 text-purple-400">{subject.total_marks}</td></tr>))}
                      <tr className="border-t-2 border-purple-200 bg-purple-50/50"><td className="py-2 sm:py-3 px-1 text-purple-600 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-pink-500 font-bold">{result.total_obtained}</td><td className="text-center py-2 sm:py-3 px-1 text-purple-400 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-white">{result.percentage}</p></div>
                  <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-white">{result.grade}</p></div>
                  <div className="bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/80 text-[10px] sm:text-xs mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-white leading-tight">{result.remarks}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="pastel" />
          </>
        )}
      </main>
    </div>
  );
};

export default PastelPortal;
