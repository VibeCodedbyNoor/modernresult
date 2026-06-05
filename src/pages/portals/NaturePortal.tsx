import { Leaf } from 'lucide-react';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';
import { usePortalSearch } from '@/hooks/usePortalSearch';
import type { PortalProps } from '@/lib/portalTypes';
import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const NaturePortal = ({ isDemo = true, schoolName = "Green Valley School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult , availableClasses, hideClassSelector }: PortalProps) => {
  const { selectedClass, setSelectedClass, formValues, setField, loading, result, error, resultRef, handleSubmit } = usePortalSearch({ isDemo, onSearch, demoResult });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-lime-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-green-400/10 to-transparent"></div><div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950/50 to-transparent"></div></div>
      <BackButton isDemo={isDemo} variant="nature" />
      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-6 pb-20 max-w-3xl">
        <header className="text-center mb-6 sm:mb-12">
          <div className="relative inline-block mb-3 sm:mb-6">
            <Leaf className="absolute -top-1 sm:-top-4 -left-1 sm:-left-4 w-4 h-4 sm:w-8 sm:h-8 text-green-400 animate-bounce" />
            <Leaf className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-4 h-4 sm:w-8 sm:h-8 text-green-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
            {logoUrl && <img src={logoUrl} alt={schoolName} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover border-2 border-green-400/30" />}
            <h1 className="relative text-xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300 px-6 sm:px-0">{schoolName}</h1>
          </div>
          <div className="w-20 sm:w-32 h-0.5 sm:h-1 mx-auto bg-gradient-to-r from-transparent via-green-400 to-transparent mb-2 sm:mb-4"></div>
          <p className="text-green-300/70 text-[10px] sm:text-lg italic">Growing Minds, Nurturing Futures</p>
        </header>
        <div className="relative mb-4 sm:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div>
          <div className="relative bg-green-900/80 backdrop-blur-sm border sm:border-2 border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl">
            <div className="text-center mb-4 sm:mb-6"><h2 className="text-xl sm:text-3xl font-bold text-green-300 mb-1 sm:mb-2">Student Result Inquiry</h2><div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-green-400 to-transparent"></div></div>
            <form onSubmit={(e) => handleSubmit(e, searchFields)} className="space-y-4 sm:space-y-6">
              {!hideClassSelector && (<div><label className="block text-xs sm:text-sm font-semibold text-green-200 mb-2 sm:mb-3">Class Selection</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-green-950/50 border sm:border-2 border-green-400/30 text-sm sm:text-base text-green-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-green-400 transition-all shadow-lg" required><option value="">Select Your Class...</option>{(availableClasses ?? Object.keys(CLASS_SUBJECTS)).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>)}
              {searchFields.map(field => (
                <div key={field}><label className="block text-xs sm:text-sm font-semibold text-green-200 mb-2 sm:mb-3">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setField(field, e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-green-950/50 border sm:border-2 border-green-400/30 text-sm sm:text-base text-green-100 rounded-lg sm:rounded-xl placeholder-green-400/50 focus:outline-none focus:border-green-400 transition-all shadow-lg" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 hover:from-green-400 hover:via-emerald-400 hover:to-lime-400 text-sm sm:text-lg text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-2xl disabled:opacity-50"><span className="flex items-center justify-center gap-2">{loading ? 'Processing...' : <><Leaf className="w-4 h-4 sm:w-5 sm:h-5" /> View Result</>}</span></button>
            </form>
          </div>
        </div>
        {error && (<div className="relative mb-4 sm:mb-8"><div className="absolute -inset-1 bg-red-600 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div><div className="relative bg-green-900/80 backdrop-blur-sm border sm:border-2 border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"><p className="text-red-400 text-center text-sm sm:text-base">{error}</p></div></div>)}
        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 rounded-xl sm:rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-green-900/80 backdrop-blur-sm border sm:border-2 border-green-400/30 rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-2xl">
                <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-green-400/30"><h3 className="text-base sm:text-xl font-bold text-green-300 mb-0.5 sm:mb-1">{schoolName}</h3><p className="text-green-400/70 text-xs sm:text-sm italic">Academic Excellence Report</p></div>
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-lg sm:text-2xl text-green-100 font-bold mb-1">{result.name}</p>
                  {result.father_name && <p className="text-sm sm:text-base text-green-300/70 mb-3 sm:mb-4">Father: {result.father_name}</p>}
                  {!result.father_name && <div className="mb-3 sm:mb-4"></div>}
                  <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-950/50 border border-green-400/30 rounded-lg text-xs sm:text-base text-green-200">Class: <strong className="text-green-100">{result.class}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-950/50 border border-green-400/30 rounded-lg text-xs sm:text-base text-green-200">Position: <strong className="text-green-100">{result.position}</strong></span>
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-950/50 border border-green-400/30 rounded-lg text-xs sm:text-base text-green-200">Grade: <strong className="text-lime-400">{result.grade}</strong></span>
                  </div>
                </div>
                <div className="bg-green-950/50 border border-green-400/20 rounded-lg sm:rounded-xl p-2 sm:p-6 mb-4 sm:mb-6 -mx-1 sm:mx-0">
                  <table className="w-full text-xs sm:text-base">
                    <thead><tr className="border-b-2 border-green-400/30"><th className="text-left py-2 sm:py-3 px-1 text-green-300 font-bold">Subject</th><th className="text-center py-2 sm:py-3 px-1 text-green-300 font-bold w-14 sm:w-auto">Obtained</th><th className="text-center py-2 sm:py-3 px-1 text-green-300 font-bold w-14 sm:w-auto">Total</th></tr></thead>
                    <tbody>
                      {result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-green-400/10"><td className="py-1.5 sm:py-3 px-1 text-green-100">{subject.subject}</td><td className="text-center py-1.5 sm:py-3 px-1 text-lime-400 font-semibold">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-3 px-1 text-green-300/70">{subject.total_marks}</td></tr>))}
                      <tr className="border-t-2 border-green-400/30 bg-green-400/5"><td className="py-2 sm:py-3 px-1 text-green-300 font-bold">TOTAL</td><td className="text-center py-2 sm:py-3 px-1 text-lime-400 font-bold">{result.total_obtained}</td><td className="text-center py-2 sm:py-3 px-1 text-green-300/70 font-bold">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Percentage</p><p className="text-sm sm:text-2xl font-bold text-white">{result.percentage}</p></div>
                  <div className="bg-gradient-to-br from-emerald-600 to-lime-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Grade</p><p className="text-sm sm:text-2xl font-bold text-white">{result.grade}</p></div>
                  <div className="bg-gradient-to-br from-lime-600 to-green-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg"><p className="text-white/70 text-[10px] sm:text-xs mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-bold text-white leading-tight">{result.remarks}</p></div>
                </div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="nature" />
          </>
        )}
      </main>
    </div>
  );
};

export default NaturePortal;
