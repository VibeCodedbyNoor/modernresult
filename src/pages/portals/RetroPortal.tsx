import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';
import { PortalProps, SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';
import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const RetroPortal = ({ isDemo = true, schoolName = "Government High School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult }: PortalProps) => {
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
    else if (onSearch) { try { const r = await onSearch({ className: selectedClass, rollNumber: formValues['roll_number'] || '', studentName: formValues['student_name'] || '', fatherName: formValues['father_name'] || '' }); if (r) { setResult(r); toast.success('Result loaded successfully!'); } else { setError('No result found'); } } catch (err: any) { setError(err?.message || 'Search failed'); } finally { setLoading(false); } }
  };

  return (
    <div className="min-h-screen bg-[#f4e4c1]" style={{ fontFamily: 'Courier New, monospace' }}>
      <BackButton variant="light" />
      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className="bg-[#d4a574] border-2 sm:border-4 border-[#8b6f47] rounded-lg p-4 sm:p-8 shadow-[4px_4px_0px_#8b6f47] sm:shadow-[8px_8px_0px_#8b6f47]">
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-14 w-14 mx-auto mb-3 rounded-full object-cover border-2 border-[#8b6f47]" />}
            <h1 className="text-xl sm:text-4xl font-bold text-[#4a3728] mb-2 sm:mb-3" style={{ textShadow: '2px 2px 0px #8b6f47' }}>{schoolName}</h1>
            <div className="h-0.5 sm:h-1 w-24 sm:w-32 mx-auto bg-[#8b6f47] mb-2 sm:mb-3"></div>
            <p className="text-sm sm:text-xl text-[#5d4a3a] font-semibold">Result Portal</p>
          </div>
        </header>
        <div className="bg-[#e8d4b0] border-2 sm:border-4 border-[#8b6f47] rounded-lg p-4 sm:p-8 mb-4 sm:mb-8 shadow-[4px_4px_0px_#8b6f47] sm:shadow-[8px_8px_0px_#8b6f47]">
          <h2 className="text-lg sm:text-2xl font-bold text-[#4a3728] mb-4 sm:mb-6 text-center">~* Check Your Result *~</h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div><label className="block text-xs sm:text-sm font-bold text-[#5d4a3a] mb-1.5 sm:mb-2">◆ Select Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 sm:border-3 border-[#8b6f47] bg-[#f4e4c1] text-sm sm:text-base text-[#4a3728] rounded focus:outline-none focus:border-[#5d4a3a] transition-colors" required><option value="">Choose your class...</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
            {searchFields.map(field => (
              <div key={field}><label className="block text-xs sm:text-sm font-bold text-[#5d4a3a] mb-1.5 sm:mb-2">◆ {SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setFormValues(prev => ({ ...prev, [field]: e.target.value }))} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 sm:border-3 border-[#8b6f47] bg-[#f4e4c1] text-sm sm:text-base text-[#4a3728] rounded placeholder-[#8b6f47]/60 focus:outline-none focus:border-[#5d4a3a] transition-colors" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-[#d4a574] hover:bg-[#c49563] border-2 sm:border-4 border-[#8b6f47] text-sm sm:text-base text-[#4a3728] font-bold rounded transition-all shadow-[2px_2px_0px_#8b6f47] sm:shadow-[4px_4px_0px_#8b6f47] disabled:opacity-50">{loading ? '⌛ Loading...' : '✓ CHECK RESULT'}</button>
          </form>
        </div>
        {error && (<div className="bg-[#d4857a] border-2 sm:border-4 border-[#8b4747] rounded-lg p-4 sm:p-6 mb-4 sm:mb-8 shadow-[4px_4px_0px_#8b4747] sm:shadow-[8px_8px_0px_#8b4747]"><p className="text-[#4a2828] text-center text-sm sm:text-base font-bold">⚠ {error}</p></div>)}
        {result && !error && (
          <>
            <div ref={resultRef} className="bg-[#e8d4b0] border-2 sm:border-4 border-[#8b6f47] rounded-lg p-3 sm:p-8 shadow-[4px_4px_0px_#8b6f47] sm:shadow-[8px_8px_0px_#8b6f47]">
              <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#8b6f47]"><h3 className="text-base sm:text-2xl font-bold text-[#4a3728] mb-0.5 sm:mb-1">{schoolName}</h3></div>
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-base sm:text-2xl text-[#5d4a3a] font-bold mb-1">{result.name || result.student_name}</p>
                {result.father_name && <p className="text-sm text-[#8b6f47] mb-3 sm:mb-4">Father: {result.father_name}</p>}
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#f4e4c1] border-2 border-[#8b6f47] rounded text-xs sm:text-base text-[#4a3728] font-semibold">Class: {result.class || result.class_name}</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#f4e4c1] border-2 border-[#8b6f47] rounded text-xs sm:text-base text-[#4a3728] font-semibold">Position: {result.position || '—'} ★</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#f4e4c1] border-2 border-[#8b6f47] rounded text-xs sm:text-base text-[#4a3728] font-semibold">Grade: {result.grade}</span>
                </div>
              </div>
              <div className="bg-[#f4e4c1] border-2 sm:border-3 border-[#8b6f47] rounded p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0"><table className="w-full text-xs sm:text-base"><thead><tr className="border-b-2 border-[#8b6f47]"><th className="text-left py-2 sm:py-3 px-1 text-[#4a3728] font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-[#4a3728] font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-[#4a3728] font-bold w-14 sm:w-auto">Total</th></tr></thead><tbody>{result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-[#8b6f47]/30"><td className="py-1.5 sm:py-2 px-1 text-[#5d4a3a] font-semibold">{subject.subject || subject.name}</td><td className="text-center py-1.5 sm:py-2 px-1 text-[#4a3728] font-bold">{subject.obtained_marks || subject.obtained}</td><td className="text-center py-1.5 sm:py-2 px-1 text-[#8b6f47]">{subject.total_marks || subject.total}</td></tr>))}<tr className="border-t-2 border-[#8b6f47]"><td className="py-2 sm:py-2 px-1 text-[#4a3728] font-bold">TOTAL</td><td className="text-center py-2 sm:py-2 px-1 text-[#4a3728] font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td><td className="text-center py-2 sm:py-2 px-1 text-[#8b6f47] font-bold">{result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}</td></tr></tbody></table></div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-[#d4a574] border-2 border-[#8b6f47] rounded-lg p-2 sm:p-4 text-center shadow-[2px_2px_0px_#8b6f47] sm:shadow-[4px_4px_0px_#8b6f47]"><p className="text-[#5d4a3a] text-[10px] sm:text-xs mb-0.5">★ Percentage ★</p><p className="text-sm sm:text-2xl font-bold text-[#4a3728]">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p></div>
                <div className="bg-[#d4a574] border-2 border-[#8b6f47] rounded-lg p-2 sm:p-4 text-center shadow-[2px_2px_0px_#8b6f47] sm:shadow-[4px_4px_0px_#8b6f47]"><p className="text-[#5d4a3a] text-[10px] sm:text-xs mb-0.5">★ Grade ★</p><p className="text-sm sm:text-2xl font-bold text-[#4a3728]">{result.grade}</p></div>
                <div className="bg-[#d4a574] border-2 border-[#8b6f47] rounded-lg p-2 sm:p-4 text-center shadow-[2px_2px_0px_#8b6f47] sm:shadow-[4px_4px_0px_#8b6f47]"><p className="text-[#5d4a3a] text-[10px] sm:text-xs mb-0.5">★ Remarks ★</p><p className="text-[10px] sm:text-sm font-bold text-[#4a3728] leading-tight">{result.remarks || 'Excellent'}</p></div>
              </div>
            </div>
            <ResultActions studentName={result.name || result.student_name} schoolName={schoolName} percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage} grade={result.grade} resultRef={resultRef} variant="retro" />
          </>
        )}
      </main>
    </div>
  );
};

export default RetroPortal;
