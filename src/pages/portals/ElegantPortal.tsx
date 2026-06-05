import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { Gem } from 'lucide-react';
import { PortalProps, SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const ElegantPortal = ({ isDemo = true, schoolName = "The Cambridge School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult , availableClasses, hideClassSelector }: PortalProps) => {
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
    else if (onSearch) { try { const r = await onSearch({ className: selectedClass, rollNumber: formValues['roll_number'] || '', studentName: formValues['student_name'] || '', fatherName: formValues['father_name'] || '' }); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found for the given details.'); } } catch (err: any) { setError(err?.message || 'An error occurred while searching.'); } finally { setLoading(false); } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-rose-50 to-stone-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-20 right-20 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-30"></div><div className="absolute bottom-20 left-20 w-64 h-64 bg-stone-200 rounded-full blur-3xl opacity-30"></div></div>
      <BackButton isDemo={isDemo} variant="elegant" />
      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-6 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          {logoUrl ? (<img src={logoUrl} alt={schoolName} className="h-20 w-20 mx-auto mb-4 rounded-full object-cover shadow-lg border-2 border-stone-200" />) : (<div className="relative inline-block mb-3 sm:mb-6"><Gem className="absolute -top-1 sm:-top-4 -left-1 sm:-left-4 w-4 h-4 sm:w-8 sm:h-8 text-rose-400" /><Gem className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-4 h-4 sm:w-8 sm:h-8 text-rose-400" /><h1 className="relative text-xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-800 px-6 sm:px-0">{schoolName}</h1></div>)}
          {logoUrl && <h1 className="relative text-xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-800 px-6 sm:px-0">{schoolName}</h1>}
          <div className="w-20 sm:w-32 h-0.5 sm:h-1 mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent mb-2 sm:mb-4 mt-2"></div>
          <p className="text-stone-600 text-xs sm:text-xl mb-1">Result Portal</p>
          <p className="text-rose-500/70 text-[10px] sm:text-lg italic font-serif">Refined Excellence in Education</p>
        </header>

        <div className="relative mb-4 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 via-stone-200 to-rose-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
          <div className="relative bg-white/90 backdrop-blur-sm border sm:border-2 border-stone-200 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
            <div className="text-center mb-4 sm:mb-6"><h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-800 mb-1 sm:mb-2">Student Result Inquiry</h2><div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div></div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!hideClassSelector && (<div><label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-2 sm:mb-3 font-serif">Class Selection</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border sm:border-2 border-stone-200 text-sm sm:text-base text-stone-800 rounded-lg sm:rounded-xl focus:outline-none focus:border-rose-400 transition-all shadow-sm" required><option value="">Select Your Class...</option>{(availableClasses ?? Object.keys(CLASS_SUBJECTS)).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>)}
              {searchFields.map(field => (
                <div key={field}><label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-2 sm:mb-3 font-serif">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-stone-50 border sm:border-2 border-stone-200 text-sm sm:text-base text-stone-800 rounded-lg sm:rounded-xl placeholder-stone-400 focus:outline-none focus:border-rose-400 transition-all shadow-sm" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-stone-700 via-rose-600 to-stone-700 hover:from-stone-600 hover:via-rose-500 hover:to-stone-600 text-sm sm:text-lg text-white font-serif font-bold rounded-lg sm:rounded-xl transition-all shadow-lg disabled:opacity-50"><span className="flex items-center justify-center gap-2">{loading ? 'Processing...' : <><Gem className="w-4 h-4 sm:w-5 sm:h-5" /> View Result</>}</span></button>
            </form>
          </div>
        </div>

        {error && (<div className="relative mb-4 sm:mb-8"><div className="absolute -inset-1 bg-red-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div><div className="relative bg-white/90 backdrop-blur-sm border sm:border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"><p className="text-red-600 text-center text-sm sm:text-base font-serif">{error}</p></div></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 via-stone-200 to-rose-200 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
              <div className="relative bg-white/90 backdrop-blur-sm border sm:border-2 border-stone-200 rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-xl">
                <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-stone-200"><h3 className="text-base sm:text-xl font-serif font-bold text-stone-800 mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-rose-500/70 text-xs sm:text-sm italic font-serif">Certificate of Academic Excellence</p></div>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-lg sm:text-2xl text-stone-800 font-serif font-bold mb-1">{result.name || result.student_name}</p>
                  {result.father_name && <p className="text-sm sm:text-base text-stone-500 font-serif mb-3 sm:mb-4">Father: {result.father_name}</p>}
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-base text-stone-600 font-serif">Class: <strong className="text-stone-800">{result.class || result.class_name}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-base text-stone-600 font-serif">Position: <strong className="text-stone-800">{result.position || '—'}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-base text-stone-600 font-serif">Grade: <strong className="text-rose-600">{result.grade}</strong></span>
                  </div>
                </div>
                <div className="bg-stone-50 border border-stone-100 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0"><table className="w-full text-xs sm:text-base font-serif"><thead><tr className="border-b-2 border-stone-200"><th className="text-left py-2 sm:py-3 px-1 text-stone-700 font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-stone-700 font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-stone-700 font-bold w-14 sm:w-auto">Total</th></tr></thead><tbody>{result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-stone-100"><td className="py-1.5 sm:py-3 px-1 text-stone-800">{subject.subject || subject.name}</td><td className="text-center py-1.5 sm:py-3 px-1 text-rose-600 font-semibold">{subject.obtained_marks || subject.obtained}</td><td className="text-center py-1.5 sm:py-3 px-1 text-stone-400">{subject.total_marks || subject.total}</td></tr>))}<tr className="border-t-2 border-stone-200 bg-rose-50/50"><td className="py-2 sm:py-3 px-1 text-stone-700 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-rose-600 font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td><td className="text-center py-2 sm:py-3 px-1 text-stone-400 font-bold">{result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}</td></tr></tbody></table></div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gradient-to-br from-stone-600 to-stone-700 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-stone-300 text-[10px] sm:text-xs mb-0.5 font-serif">Percentage</p><p className="text-sm sm:text-2xl font-bold text-white font-serif">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p></div>
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-rose-100 text-[10px] sm:text-xs mb-0.5 font-serif">Grade</p><p className="text-sm sm:text-2xl font-bold text-white font-serif">{result.grade}</p></div>
                  <div className="bg-gradient-to-br from-stone-700 to-stone-800 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-stone-300 text-[10px] sm:text-xs mb-0.5 font-serif">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-white leading-tight font-serif">{result.remarks || 'Excellent'}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name || result.student_name} schoolName={schoolName} percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage} grade={result.grade} resultRef={resultRef} variant="elegant" />
          </>
        )}
      </main>
    </div>
  );
};

export default ElegantPortal;
