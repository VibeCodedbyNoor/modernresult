import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { Sparkles } from 'lucide-react';
import { PortalProps, SearchParams, SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const LuxuryGoldPortal = ({ isDemo = true, schoolName = "Royal Cambridge School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult , availableClasses, hideClassSelector }: PortalProps) => {
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
    if (isDemo) {
      setTimeout(() => {
        const name = formValues['student_name'] || formValues['roll_number'] || 'Student';
        setResult(generateDemoResult(name, selectedClass));
        setLoading(false);
        toast.success('Result loaded successfully!');
      }, 1000);
    } else if (onSearch) {
      try {
        const r = await onSearch({ className: selectedClass, rollNumber: formValues['roll_number'] || '', studentName: formValues['student_name'] || '', fatherName: formValues['father_name'] || '' });
        if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); }
      } catch (err: any) { setError(err?.message || 'Search failed'); } finally { setLoading(false); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 relative overflow-hidden">
      
      <BackButton isDemo={isDemo} variant="luxury" />
      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-6 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className="relative inline-block mb-3 sm:mb-6">
            <Sparkles className="absolute -top-1 sm:-top-4 -left-1 sm:-left-4 w-4 h-4 sm:w-8 sm:h-8 text-amber-400" />
            <Sparkles className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-4 h-4 sm:w-8 sm:h-8 text-amber-400" />
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover border-2 border-amber-500/30" />}
            <h1 className="relative text-xl sm:text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-6 sm:px-0" style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}>{schoolName}</h1>
          </div>
          <div className="w-20 sm:w-32 h-0.5 sm:h-1 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-2 sm:mb-4"></div>
          <p className="text-amber-200/80 text-[10px] sm:text-lg font-serif italic">Online Result Portal</p>
        </header>

        <div className="relative mb-4 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div>
          <div className="relative bg-slate-800/90 backdrop-blur-sm border sm:border-2 border-amber-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl">
            <div className="text-center mb-4 sm:mb-6"><h2 className="text-xl sm:text-3xl font-serif font-bold text-amber-400 mb-1 sm:mb-2">Student Result Inquiry</h2><div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div></div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {!hideClassSelector && (<div><label className="block text-xs sm:text-sm font-serif font-semibold text-amber-300 mb-2 sm:mb-3">Class Selection</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border sm:border-2 border-amber-500/30 text-sm sm:text-base text-amber-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-amber-500 transition-all font-serif shadow-lg" required><option value="">Select Your Class...</option>{(availableClasses ?? Object.keys(CLASS_SUBJECTS)).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>)}
              {searchFields.map(field => (
                <div key={field}><label className="block text-xs sm:text-sm font-serif font-semibold text-amber-300 mb-2 sm:mb-3">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/50 border sm:border-2 border-amber-500/30 text-sm sm:text-base text-amber-100 rounded-lg sm:rounded-xl placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-serif shadow-lg" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-sm sm:text-lg text-slate-900 font-serif font-bold rounded-lg sm:rounded-xl transition-all shadow-2xl disabled:opacity-50"><span className="flex items-center justify-center gap-2">{loading ? 'Processing...' : <><Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> View Result</>}</span></button>
            </form>
          </div>
        </div>

        {error && (<div className="relative mb-4 sm:mb-8"><div className="absolute -inset-1 bg-red-600 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div><div className="relative bg-slate-800/90 backdrop-blur-sm border sm:border-2 border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"><p className="text-red-400 text-center text-sm sm:text-base font-serif">{error}</p></div></div>)}

        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-sm border sm:border-2 border-amber-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-2xl">
                <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-amber-500/30"><h3 className="text-base sm:text-xl font-serif font-bold text-amber-400 mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-amber-300/70 text-xs sm:text-sm font-serif italic">Certificate of Achievement</p></div>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-lg sm:text-2xl text-amber-100 font-serif font-bold mb-1">{result.name}</p>
                  {result.father_name && <p className="text-sm sm:text-base text-amber-300/70 font-serif mb-3 sm:mb-4">Father: {result.father_name}</p>}
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-amber-500/30 rounded-lg text-xs sm:text-base text-amber-300 font-serif">Class: <strong className="text-amber-100">{result.class}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-amber-500/30 rounded-lg text-xs sm:text-base text-amber-300 font-serif">Position: <strong className="text-amber-100">{result.position}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-amber-500/30 rounded-lg text-xs sm:text-base text-amber-300 font-serif">Grade: <strong className="text-amber-400">{result.grade}</strong></span>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0">
                  <table className="w-full font-serif text-xs sm:text-base">
                    <thead><tr className="border-b-2 border-amber-500/30"><th className="text-left py-2 sm:py-3 px-1 text-amber-400 font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-amber-400 font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-amber-400 font-bold w-14 sm:w-auto">Total</th></tr></thead>
                    <tbody>
                      {result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-amber-500/10"><td className="py-1.5 sm:py-3 px-1 text-amber-100">{subject.subject}</td><td className="text-center py-1.5 sm:py-3 px-1 text-yellow-400 font-semibold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-3 px-1 text-amber-300/70">{subject.total_marks}</td></tr>))}
                      <tr className="border-t-2 border-amber-500/30 bg-amber-500/5"><td className="py-2 sm:py-3 px-1 text-amber-400 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-yellow-400 font-bold">{result.total_obtained}</td><td className="text-center py-2 sm:py-3 px-1 text-amber-300/70 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gradient-to-br from-amber-600 to-yellow-500 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-slate-900/70 text-[10px] sm:text-xs mb-0.5 font-serif">Percentage</p><p className="text-sm sm:text-2xl font-bold text-slate-900 font-serif">{result.percentage}</p></div>
                  <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-slate-900/70 text-[10px] sm:text-xs mb-0.5 font-serif">Grade</p><p className="text-sm sm:text-2xl font-bold text-slate-900 font-serif">{result.grade}</p></div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-slate-900/70 text-[10px] sm:text-xs mb-0.5 font-serif">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-slate-900 font-serif leading-tight">{result.remarks}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="luxury" />
          </>
        )}
      </main>
    </div>
  );
};

export default LuxuryGoldPortal;
