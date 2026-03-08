import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps { isDemo?: boolean; schoolName?: string; logoUrl?: string | null; onSearch?: (className: string, studentName: string) => Promise<any>; demoResult?: any; }

const NeumorphismPortal = ({ isDemo = true, schoolName = "Army Burn Hall College", logoUrl, onSearch, demoResult }: PortalProps) => {
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

  const neuStyle = "shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] sm:shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]";
  const neuStyleInset = "shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] sm:shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff]";

  return (
    <div className="min-h-screen bg-[#e0e5ec]">
      <PortalBranding variant="light" />
      <BackButton variant="light" />
      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className={`${neuStyle} rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-[#e0e5ec]`}>
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-14 w-14 mx-auto mb-3 rounded-full object-cover" />}
            <h1 className="text-xl sm:text-4xl font-bold text-gray-700 mb-1 sm:mb-2">{schoolName}</h1>
            <p className="text-sm sm:text-lg text-gray-600">Result Portal</p>
          </div>
        </header>

        <div className={`${neuStyle} rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-[#e0e5ec] mb-4 sm:mb-8`}>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-700 mb-4 sm:mb-6">Check Your Result</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div><label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Select Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={`${neuStyleInset} w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#e0e5ec] text-sm sm:text-base text-gray-700 focus:outline-none transition-all`} required><option value="">Choose your class</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
            <div><label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-2 sm:mb-3">Student Name</label><input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className={`${neuStyleInset} w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#e0e5ec] text-sm sm:text-base text-gray-700 placeholder-gray-500 focus:outline-none transition-all`} placeholder="Enter your name" required /></div>
            <button type="submit" disabled={loading} className={`${neuStyle} w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl bg-[#e0e5ec] text-sm sm:text-base text-gray-700 font-bold transition-all active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50`}>{loading ? 'Loading...' : 'CHECK RESULT'}</button>
          </form>
        </div>

        {error && (<div className={`${neuStyleInset} rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[#e0e5ec] mb-4 sm:mb-8`}><p className="text-red-600 text-center text-sm sm:text-base font-semibold">{error}</p></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className={`${neuStyle} rounded-2xl sm:rounded-3xl p-3 sm:p-8 bg-[#e0e5ec]`}>
              <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-300"><h3 className="text-base sm:text-xl font-bold text-gray-700 mb-0.5 sm:mb-1">{schoolName}</h3></div>
              <div className="text-center mb-4 sm:mb-8">
                <p className="text-base sm:text-xl text-gray-800 font-semibold mb-3 sm:mb-4">{result.name}</p>
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                  <span className={`${neuStyle} px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base text-gray-700 font-semibold`}>Class: {result.class}</span>
                  <span className={`${neuStyle} px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base text-gray-700 font-semibold`}>Position: {result.position}</span>
                  <span className={`${neuStyle} px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-base text-gray-700 font-semibold`}>Grade: {result.grade}</span>
                </div>
              </div>
              <div className={`${neuStyleInset} rounded-xl sm:rounded-2xl p-2 sm:p-6 bg-[#e0e5ec] mb-4 sm:mb-6 -mx-1 sm:mx-0`}>
                <table className="w-full text-xs sm:text-base">
                  <thead><tr className="border-b-2 border-gray-400"><th className="text-left py-2 sm:py-3 px-1 text-gray-700 font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-gray-700 font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-gray-700 font-bold w-14 sm:w-auto">Total</th></tr></thead>
                  <tbody>
                    {result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-gray-300"><td className="py-1.5 sm:py-3 px-1 text-gray-700 font-medium">{subject.subject}</td><td className="text-center py-1.5 sm:py-3 px-1 text-gray-800 font-bold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-3 px-1 text-gray-600">{subject.total_marks}</td></tr>))}
                    <tr className="border-t-2 border-gray-400"><td className="py-2 sm:py-3 px-1 text-gray-700 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-gray-800 font-bold">{result.total_obtained}</td><td className="text-center py-2 sm:py-3 px-1 text-gray-600 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className={`${neuStyle} rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 bg-[#e0e5ec] text-center`}><p className="text-gray-600 text-[10px] sm:text-xs mb-0.5">Percentage</p><p className="text-sm sm:text-xl font-bold text-gray-800">{result.percentage}</p></div>
                <div className={`${neuStyle} rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 bg-[#e0e5ec] text-center`}><p className="text-gray-600 text-[10px] sm:text-xs mb-0.5">Grade</p><p className="text-sm sm:text-xl font-bold text-gray-800">{result.grade}</p></div>
                <div className={`${neuStyle} rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 bg-[#e0e5ec] text-center`}><p className="text-gray-600 text-[10px] sm:text-xs mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-gray-700 leading-tight">{result.remarks}</p></div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="light" />
          </>
        )}
      </main>
    </div>
  );
};

export default NeumorphismPortal;
