import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { Moon } from 'lucide-react';
import { PortalProps, SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const DarkModePortal = ({ isDemo = true, schoolName = "Cadet College", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult }: PortalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasValue = searchFields.some(f => formValues[f]?.trim());
    if (!selectedClass || !hasValue) { toast.error('Please fill in the required fields'); return; }
    setLoading(true); setError(''); setResult(null);
    if (isDemo) { setTimeout(() => { const name = formValues['student_name'] || formValues['roll_number'] || 'Student'; setResult(generateDemoResult(name, selectedClass)); setLoading(false); toast.success('Result loaded successfully!'); }, 1000); }
    else if (onSearch) { try { const r = await onSearch({ className: selectedClass, rollNumber: formValues['roll_number'] || '', studentName: formValues['student_name'] || '', fatherName: formValues['father_name'] || '' }); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found for the given details.'); } } catch { setError('An error occurred while searching.'); } finally { setLoading(false); } }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <BackButton variant="dark" />
      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-3xl relative z-10">
        <header className="text-center mb-6 sm:mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-20 w-20 mx-auto mb-4 rounded-full object-cover shadow-lg border-2 border-gray-700" />}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">{!logoUrl && <Moon className="w-5 h-5 sm:w-8 sm:h-8 text-blue-400" />}<h1 className="text-xl sm:text-4xl font-bold text-white">{schoolName}</h1></div>
            <p className="text-sm sm:text-lg text-gray-400">Result Portal</p>
          </div>
        </header>

        <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">Check Your Result</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div><label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Select Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 transition-all" required><option value="">Choose your class</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
            {searchFields.map(field => (
              <div key={field}><label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 px-6 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base text-white font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50">{loading ? 'Loading...' : 'CHECK RESULT'}</button>
          </form>
        </div>

        {error && (<div className="bg-red-900/20 border border-red-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8"><p className="text-red-400 text-center text-sm sm:text-base">{error}</p></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-xl">
              <div className="text-center mb-3 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-700"><h3 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-gray-500 text-xs sm:text-sm">Academic Result</p></div>
              <div className="text-center mb-4 sm:mb-8">
                <p className="text-base sm:text-xl text-gray-300 mb-1 font-semibold">{result.name || result.student_name}</p>
                {result.father_name && <p className="text-sm text-gray-500 mb-2 sm:mb-4">Father: {result.father_name}</p>}
                <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-8 text-xs sm:text-base text-gray-400"><span>Class: <strong className="text-white">{result.class || result.class_name}</strong></span><span>Position: <strong className="text-white">{result.position || '—'}</strong></span><span>Grade: <strong className="text-blue-400">{result.grade}</strong></span></div>
              </div>
              <div className="bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-3 sm:mb-6 -mx-1 sm:mx-0">
                <table className="w-full text-xs sm:text-base"><thead><tr className="border-b border-gray-700"><th className="text-left py-2 sm:py-3 px-2 text-gray-300 font-semibold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-gray-300 font-semibold w-14 sm:w-auto">Marks</th><th className="text-center py-2 sm:py-3 px-1 text-gray-300 font-semibold w-14 sm:w-auto">Total</th></tr></thead>
                  <tbody>{result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-gray-700/50"><td className="py-1.5 sm:py-3 px-2 text-white">{subject.subject || subject.name}</td><td className="text-center py-1.5 sm:py-3 px-1 text-blue-400 font-semibold">{subject.obtained_marks || subject.obtained}</td><td className="text-center py-1.5 sm:py-3 px-1 text-gray-400">{subject.total_marks || subject.total}</td></tr>))}<tr className="border-t-2 border-gray-600 bg-gray-700/30"><td className="py-2 sm:py-3 px-2 text-white font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-blue-400 font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td><td className="text-center py-2 sm:py-3 px-1 text-gray-400 font-bold">{result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}</td></tr></tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-gray-400 text-[10px] sm:text-sm mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-blue-400">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p></div>
                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-gray-400 text-[10px] sm:text-sm mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-white">{result.grade}</p></div>
                <div className="bg-gray-800 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"><p className="text-gray-400 text-[10px] sm:text-sm mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-green-400 leading-tight">{result.remarks || 'Excellent'}</p></div>
              </div>
            </div>
            <ResultActions studentName={result.name || result.student_name} schoolName={schoolName} percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage} grade={result.grade} resultRef={resultRef} variant="dark" />
          </>
        )}
      </main>
    </div>
  );
};

export default DarkModePortal;
