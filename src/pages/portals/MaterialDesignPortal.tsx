import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { CheckCircle2 } from 'lucide-react';
import { PortalProps, SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';
import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const MaterialDesignPortal = ({ isDemo = true, schoolName = "Swat Public School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult , availableClasses, hideClassSelector }: PortalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasValue = searchFields.some(f => formValues[f]?.trim());
    if ((!hideClassSelector && !selectedClass) || !hasValue) { toast.error('Please fill in the required fields'); return; }
    setLoading(true); setError(''); setResult(null);
    if (isDemo) { setTimeout(() => { const name = formValues['student_name'] || formValues['roll_number'] || 'Student'; setResult(generateDemoResult(name, selectedClass)); setLoading(false); toast.success('Result loaded successfully!'); }, 1000); }
    else if (onSearch) { try { const r = await onSearch({ className: selectedClass, rollNumber: formValues['roll_number'] || '', studentName: formValues['student_name'] || '', fatherName: formValues['father_name'] || '' }); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); } } catch (err: any) { setError(err?.message || 'Search failed'); } finally { setLoading(false); } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton isDemo={isDemo} variant="light" />
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
            {!hideClassSelector && (<div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Select Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" required><option value="">Choose your class</option>{(availableClasses ?? Object.keys(CLASS_SUBJECTS)).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>)}
            {searchFields.map(field => (
              <div key={field}><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base text-white font-medium rounded-md transition-all shadow-md disabled:opacity-50">{loading ? 'Loading...' : 'CHECK RESULT'}</button>
          </form>
        </div>
        {error && (<div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 sm:p-6 mb-4 sm:mb-8 shadow-md"><p className="text-red-800 text-sm sm:text-base">{error}</p></div>)}
        {result && !error && (
          <>
            <div ref={resultRef} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-indigo-600 text-white p-3 sm:p-6"><h3 className="text-base sm:text-xl font-semibold mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-sm sm:text-lg text-indigo-100">Student Result Card</p></div>
              <div className="p-3 sm:p-8">
                <p className="text-lg sm:text-2xl font-semibold text-gray-800 mb-1 text-center">{result.name || result.student_name}</p>
                {result.father_name && <p className="text-sm text-gray-500 text-center mb-3 sm:mb-4">Father: {result.father_name}</p>}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Class</p><p className="text-sm sm:text-xl font-semibold text-gray-900">{result.class || result.class_name}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Position</p><p className="text-sm sm:text-xl font-semibold text-indigo-600">{result.position || '—'}</p></div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center shadow-sm"><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Grade</p><p className="text-sm sm:text-xl font-semibold text-green-600">{result.grade}</p></div>
                </div>
                <div className="mb-4 sm:mb-8 -mx-2 sm:mx-0"><table className="w-full text-xs sm:text-base"><thead><tr className="bg-gray-50"><th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Subject</th><th className="text-center py-2 sm:py-3 px-1 sm:px-4 font-semibold text-gray-700 w-14 sm:w-auto">Marks</th><th className="text-center py-2 sm:py-3 px-1 sm:px-4 font-semibold text-gray-700 w-14 sm:w-auto">Total</th></tr></thead><tbody className="divide-y divide-gray-200">{result.subjects?.map((subject: any, idx: number) => (<tr key={idx}><td className="py-1.5 sm:py-3 px-2 sm:px-4 text-gray-900">{subject.subject || subject.name}</td><td className="text-center py-1.5 sm:py-3 px-1 sm:px-4 text-indigo-600 font-semibold">{subject.obtained_marks || subject.obtained}</td><td className="text-center py-1.5 sm:py-3 px-1 sm:px-4 text-gray-600">{subject.total_marks || subject.total}</td></tr>))}<tr className="bg-gray-50 border-t-2 border-gray-300"><td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 sm:px-4 text-indigo-600 font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td><td className="text-center py-2 sm:py-3 px-1 sm:px-4 text-gray-600 font-bold">{result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}</td></tr></tbody></table></div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-indigo-700">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p></div>
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-indigo-700">{result.grade}</p></div>
                  <div className="bg-indigo-50 rounded-lg p-2 sm:p-4 text-center"><p className="text-[10px] sm:text-sm text-indigo-600 mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-indigo-700 leading-tight">{result.remarks || 'Excellent'}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name || result.student_name} schoolName={schoolName} percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage} grade={result.grade} resultRef={resultRef} variant="material" />
          </>
        )}
      </main>
    </div>
  );
};

export default MaterialDesignPortal;
