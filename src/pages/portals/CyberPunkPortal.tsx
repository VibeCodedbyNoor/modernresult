import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { generateDemoResult } from '@/lib/demoResults';

import BackButton from '@/components/portal/BackButton';
import ResultActions from '@/components/portal/ResultActions';

interface PortalProps {
  isDemo?: boolean;
  schoolName?: string;
  logoUrl?: string | null;
  onSearch?: (className: string, studentName: string) => Promise<any>;
  demoResult?: any;
}

const CyberPunkPortal = ({ isDemo = true, schoolName = "FRONTIER ACADEMY", logoUrl, onSearch, demoResult }: PortalProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(demoResult || null);
  const [error, setError] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !studentName) {
      toast.error('Please select a class and enter your name');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    if (isDemo) {
      setTimeout(() => {
        const demoRes = generateDemoResult(studentName, selectedClass);
        setResult(demoRes);
        setLoading(false);
        toast.success('Result loaded successfully!');
      }, 1000);
    } else if (onSearch) {
      try {
        const searchResult = await onSearch(selectedClass, studentName);
        if (searchResult) {
          setResult(searchResult);
          toast.success('Result loaded successfully!');
        } else {
          setError('No result found for the given details.');
        }
      } catch (err) {
        setError('An error occurred while searching.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      
      <BackButton variant="neon" />

      {/* Animated grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}></div>

      {/* Glowing lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

      <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-14 sm:pt-12 pb-20 max-w-4xl">
        <header className="text-center mb-6 sm:mb-12">
          {logoUrl && (
            <img src={logoUrl} alt={schoolName} className="h-20 w-20 mx-auto mb-4 rounded-full object-cover shadow-[0_0_20px_rgba(0,255,255,0.5)] border-2 border-cyan-500" />
          )}
          <div className="relative inline-block mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 mb-2 uppercase">
              {schoolName}
            </h1>
          </div>
          <p className="text-cyan-400 text-sm sm:text-xl font-mono mb-1 sm:mb-2">Result Portal</p>
          <p className="text-pink-400 text-xs sm:text-lg font-mono">&gt; RESULT_PORTAL.EXE</p>
        </header>

        <div className="relative mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl opacity-75 blur"></div>
          <div className="relative bg-gray-900 border-2 border-cyan-500 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 font-mono">&gt; CHECK_RESULT()</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-mono text-cyan-300 mb-2">
                  &gt; SELECT_CLASS
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-cyan-500/50 text-cyan-400 font-mono focus:outline-none focus:border-pink-500 transition-all"
                  required
                >
                  <option value="">CHOOSE_CLASS...</option>
                  {Object.keys(CLASS_SUBJECTS).map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-300 mb-2">
                  &gt; STUDENT_NAME_OR_ROLL
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-cyan-500/50 text-cyan-400 font-mono placeholder-cyan-700 focus:outline-none focus:border-pink-500 transition-all"
                  placeholder="ENTER_DETAILS..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-pink-500 text-black font-black font-mono text-lg transition-all disabled:opacity-50"
              >
                {loading ? 'LOADING...' : '> EXECUTE'}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="relative mb-8">
            <div className="absolute -inset-0.5 bg-red-500 rounded-xl opacity-75 blur"></div>
            <div className="relative bg-gray-900 border-2 border-red-500 rounded-xl p-6">
              <p className="text-red-400 text-center font-mono">&gt; ERROR: {error}</p>
            </div>
          </div>
        )}

        {result && !error && (
          <>
            <div ref={resultRef} className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-xl opacity-75 blur"></div>
              <div className="relative bg-gray-900 border-2 border-cyan-500 rounded-xl p-8">
                <div className="text-center mb-6 pb-4 border-b-2 border-cyan-500/50">
                  <h3 className="text-xl font-bold text-cyan-400 font-mono mb-1 uppercase">{schoolName}</h3>
                  <p className="text-pink-400 font-mono text-sm">&gt; RESULT_CARD.DAT</p>
                </div>

                <div className="text-center mb-6">
                  <p className="text-2xl text-cyan-400 font-mono font-bold mb-4">{result.name || result.student_name}</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <span className="px-4 py-2 bg-black border border-cyan-500 text-cyan-400 font-mono">
                      CLASS: {result.class || result.class_name}
                    </span>
                    <span className="px-4 py-2 bg-black border border-pink-500 text-pink-400 font-mono">
                      POSITION: {result.position || '—'}
                    </span>
                    <span className="px-4 py-2 bg-black border border-purple-500 text-purple-400 font-mono">
                      GRADE: {result.grade}
                    </span>
                  </div>
                </div>

                <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6 mb-6">
                  <table className="w-full font-mono">
                    <thead>
                      <tr className="border-b-2 border-cyan-500">
                        <th className="text-left py-3 text-cyan-400">SUBJECT</th>
                        <th className="text-center py-3 text-pink-400">OBTAINED</th>
                        <th className="text-center py-3 text-purple-400">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects?.map((subject: any, idx: number) => (
                        <tr key={idx} className="border-b border-cyan-500/30">
                          <td className="py-2 text-white">{subject.subject || subject.name}</td>
                          <td className="text-center py-2 text-pink-400 font-bold">{subject.obtained_marks || subject.obtained}</td>
                          <td className="text-center py-2 text-gray-400">{subject.total_marks || subject.total}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-cyan-500">
                        <td className="py-2 text-cyan-400 font-bold">TOTAL</td>
                        <td className="text-center py-2 text-pink-400 font-bold">{result.total_obtained || result.subjects?.reduce((sum: number, s: any) => sum + (s.obtained_marks || s.obtained || 0), 0)}</td>
                        <td className="text-center py-2 text-gray-400 font-bold">
                          {result.total_marks || result.subjects?.reduce((sum: number, s: any) => sum + (s.total_marks || s.total || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-black border-2 border-purple-500 rounded-lg p-4 text-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <p className="text-purple-400 text-xs mb-1 font-mono">PERCENTAGE</p>
                    <p className="text-2xl font-bold text-white font-mono">{typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}</p>
                  </div>
                  <div className="bg-black border-2 border-cyan-500 rounded-lg p-4 text-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                    <p className="text-cyan-400 text-xs mb-1 font-mono">GRADE</p>
                    <p className="text-2xl font-bold text-white font-mono">{result.grade}</p>
                  </div>
                  <div className="bg-black border-2 border-pink-500 rounded-lg p-4 text-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    <p className="text-pink-400 text-xs mb-1 font-mono">REMARKS</p>
                    <p className="text-sm font-bold text-white font-mono">{result.remarks || 'EXCELLENT'}</p>
                  </div>
                </div>
              </div>
            </div>

            <ResultActions
              studentName={result.name || result.student_name}
              schoolName={schoolName}
              percentage={typeof result.percentage === 'number' ? `${result.percentage.toFixed(2)}%` : result.percentage}
              grade={result.grade}
              resultRef={resultRef}
              variant="cyberpunk"
            />
          </>
        )}
      </main>
    </div>
  );
};

export default CyberPunkPortal;