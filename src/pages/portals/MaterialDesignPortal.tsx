import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { CheckCircle2 } from 'lucide-react';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps { isDemo?: boolean; schoolName?: string; logoUrl?: string | null; onSearch?: (className: string, studentName: string) => Promise<any>; demoResult?: any; }

const MaterialDesignPortal = ({ isDemo = true, schoolName = "Swat Public School", logoUrl, onSearch, demoResult }: PortalProps) => {
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
    <div className="min-h-screen bg-gray-50">
      
      <BackButton variant="light" />
      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-8 pb-20 max-w-4xl">
        <header className="mb-4 sm:mb-8">
          <div className="bg-indigo-600 text-white rounded-lg shadow-lg p-4 sm:p-8 flex items-center gap-4">
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />}
            <div><h1 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2">{schoolName}</h1><p className="text-indigo-100 text-sm sm:text-lg">Student Result Portal</p></div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />Check Your Result</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Select Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" required><option value="">Choose your class</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
            <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Student Name</label><input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" placeholder="Enter your name" required /></div>
            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base text-white font-medium rounded-md transition-all shadow-md disabled:opacity-50">{loading ? 'Loading...' : 'CHECK RESULT'}</button>
          </form>
        </div>

        {error && (<div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 sm:p-6 mb-4 sm:mb-8 shadow-md"><p className="text-red-800 text-sm sm:text-base">{error}</p></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-indigo-600 text-white p-3 sm:p-6"><h3 className="text-base sm:text-xl font-semibold mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-sm sm:text-lg text-indigo-100">Student Result Card</p></div>
              <div className="p-3 sm:p-8">
                <p className="text-lg sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 text-center">{result.name}</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Class</p><p className="text-sm sm:text-xl font-semibold text-gray-900">{result.class}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Position</p><p className="text-sm sm:text-xl font-semibold text-indigo-600">{result.position}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Grade</p><p className="text-sm sm:text-xl font-semibold text-green-600">{result.grade}</p></div>
                </div>
                <div className="mb-4 sm:mb-8 -mx-2 sm:mx-0">
                  <table className="w-full text-xs sm:text-base">
                    <thead><tr className="bg-gray-50"><th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Subject</th><th className="text-center py-2 sm:py-3 px-1 sm:px-4 font-semibold text-gray-700 w-14 sm:w-auto">Marks</th><th className="text-center py-2 sm:py-3 px-1 sm:px-4 font-semibold text-gray-700 w-14 sm:w-auto">Total</th></tr></thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.subjects?.map((subject: any, idx: number) => (<tr key={idx}><td className="py-1.5 sm:py-3 px-2 sm:px-4 text-gray-900">{subject.subject}</td><td className="text-center py-1.5 sm:py-3 px-1 sm:px-4 text-indigo-600 font-semibold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-3 px-1 sm:px-4 text-gray-600">{subject.total_marks}</td></tr>))}
                      <tr className="bg-gray-50 border-t-2 border-gray-300"><td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 sm:px-4 text-indigo-600 font-bold">{result.total_obtained}</td><td className="text-center py-2 sm:py-3 px-1 sm:px-4 text-gray-600 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-indigo-700">{result.percentage}</p></div>
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-indigo-700">{result.grade}</p></div>
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-indigo-700 leading-tight">{result.remarks}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="material" />
          </>
        )}
      </main>
    </div>
  );
};

export default MaterialDesignPortal;
