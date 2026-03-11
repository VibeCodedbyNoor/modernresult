import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { SEARCH_FIELD_LABELS, SEARCH_FIELD_PLACEHOLDERS } from '@/lib/portalTypes';
import { usePortalSearch } from '@/hooks/usePortalSearch';
import type { PortalProps } from '@/lib/portalTypes';
import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

const MinimalistPortal = ({ isDemo = true, schoolName = "Al-Huda Model School", logoUrl, onSearch, searchFields = ['roll_number', 'student_name'], demoResult }: PortalProps) => {
  const { selectedClass, setSelectedClass, formValues, setField, loading, result, error, resultRef, handleSubmit } = usePortalSearch({ isDemo, onSearch, demoResult });

  return (
    <div className="min-h-screen bg-white">
      <BackButton isDemo={isDemo} variant="light" />
      <main className="container mx-auto px-3 sm:px-4 pt-14 sm:pt-16 pb-20 max-w-2xl">
        <header className="mb-6 sm:mb-16 border-b border-black pb-4 sm:pb-8">
          {logoUrl && <img src={logoUrl} alt={schoolName} className="h-14 w-14 mb-3 rounded-full object-cover border border-gray-300" />}
          <h1 className="text-2xl sm:text-4xl font-bold text-black mb-1 sm:mb-2">{schoolName}</h1>
          <p className="text-sm sm:text-lg text-gray-600">Result Portal</p>
        </header>
        <div className="mb-6 sm:mb-12">
          <h2 className="text-lg sm:text-2xl font-semibold text-black mb-4 sm:mb-8">Check Result</h2>
          <form onSubmit={(e) => handleSubmit(e, searchFields)} className="space-y-4 sm:space-y-6">
            <div className="group"><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Class</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 bg-white text-sm sm:text-base text-black focus:outline-none focus:border-black transition-all" required><option value="">Select class</option>{Object.keys(CLASS_SUBJECTS).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</select></div>
            {searchFields.map(field => (
              <div key={field} className="group"><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">{SEARCH_FIELD_LABELS[field] || field}</label><input type="text" value={formValues[field] || ''} onChange={(e) => setField(field, e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 bg-white text-sm sm:text-base text-black focus:outline-none focus:border-black transition-all" placeholder={SEARCH_FIELD_PLACEHOLDERS[field] || ''} required /></div>
            ))}
            <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 px-6 bg-black text-sm sm:text-base text-white font-medium hover:bg-gray-800 transition-all disabled:bg-gray-400">{loading ? 'Loading...' : 'Check Result'}</button>
          </form>
        </div>
        {error && (<div className="mb-4 sm:mb-8 p-3 sm:p-4 border-l-4 border-red-500 bg-red-50"><p className="text-red-800 text-sm sm:text-base">{error}</p></div>)}
        {result && !error && (
          <>
            <div ref={resultRef} className="border-t border-black pt-4 sm:pt-8 bg-white p-3 sm:p-6">
              <div className="text-center mb-3 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200"><h3 className="text-lg sm:text-xl font-bold text-black mb-0.5 sm:mb-1">{schoolName}</h3></div>
              <div className="mb-3 sm:mb-6"><p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Student Name</p><p className="text-base sm:text-lg font-semibold text-black">{result.name}</p>{result.father_name && <p className="text-xs sm:text-sm text-gray-500 mt-1">Father: {result.father_name}</p>}</div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
                <div><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Class</p><p className="text-sm sm:text-lg font-semibold text-black">{result.class}</p></div>
                <div><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Position</p><p className="text-sm sm:text-lg font-semibold text-black">{result.position}</p></div>
                <div><p className="text-[10px] sm:text-sm text-gray-600 mb-0.5">Grade</p><p className="text-sm sm:text-lg font-semibold text-black">{result.grade}</p></div>
              </div>
              <div className="-mx-3 sm:mx-0 px-1 sm:px-0">
                <table className="w-full mb-4 sm:mb-8 text-xs sm:text-sm">
                  <thead><tr className="border-b border-black"><th className="text-left py-2 px-1 sm:px-0 font-medium">Subject</th><th className="text-center py-2 px-1 font-medium w-14 sm:w-auto">Marks</th><th className="text-center py-2 px-1 font-medium w-14 sm:w-auto">Total</th></tr></thead>
                  <tbody>
                    {result.subjects?.map((subject: any, idx: number) => (<tr key={idx} className="border-b border-gray-200"><td className="py-1.5 sm:py-2 px-1 sm:px-0 text-gray-900">{subject.subject}</td><td className="text-center py-1.5 sm:py-2 px-1 font-semibold text-black">{subject.obtained_marks}</td><td className="text-center py-1.5 sm:py-2 px-1 text-gray-600">{subject.total_marks}</td></tr>))}
                    <tr className="border-t-2 border-black bg-gray-50"><td className="py-2 px-1 sm:px-0 font-bold">TOTAL</td><td className="text-center py-2 px-1 font-bold">{result.total_obtained}</td><td className="text-center py-2 px-1 font-bold text-gray-600">{result.subjects?.reduce((sum: number, s: any) => sum + s.total_marks, 0)}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-4">
                <div className="text-center p-2 sm:p-3 border border-gray-200"><p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Percentage</p><p className="text-sm sm:text-xl font-bold">{result.percentage}</p></div>
                <div className="text-center p-2 sm:p-3 border border-gray-200"><p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Grade</p><p className="text-sm sm:text-xl font-bold">{result.grade}</p></div>
                <div className="text-center p-2 sm:p-3 border border-gray-200"><p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Remarks</p><p className="text-[10px] sm:text-sm font-semibold leading-tight">{result.remarks}</p></div>
              </div>
            </div>
            <ResultActions studentName={result.name} schoolName={schoolName} percentage={result.percentage} grade={result.grade} resultRef={resultRef} variant="light" />
          </>
        )}
      </main>
    </div>
  );
};

export default MinimalistPortal;
