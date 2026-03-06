import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RotateCcw, Award, TrendingUp, Trophy, ArrowLeft } from 'lucide-react';
import { getTemplate } from '@/lib/resultTemplates';

const DEMO_CLASSES = ['Class 9', 'Class 10'];

const DEMO_RESULTS: Record<string, {
  student_name: string;
  roll_number: string;
  class_name: string;
  grade: string;
  subjects: Record<string, { obtained: number; total: number }>;
}[]> = {
  'Class 9': [
    {
      student_name: 'Ahmed Khan',
      roll_number: '901',
      class_name: 'Class 9',
      grade: 'A+',
      subjects: {
        Mathematics: { obtained: 92, total: 100 },
        English: { obtained: 88, total: 100 },
        Science: { obtained: 95, total: 100 },
        Urdu: { obtained: 85, total: 100 },
        'Social Studies': { obtained: 90, total: 100 },
        Islamiat: { obtained: 93, total: 100 },
      },
    },
    {
      student_name: 'Fatima Ali',
      roll_number: '902',
      class_name: 'Class 9',
      grade: 'A',
      subjects: {
        Mathematics: { obtained: 78, total: 100 },
        English: { obtained: 82, total: 100 },
        Science: { obtained: 85, total: 100 },
        Urdu: { obtained: 90, total: 100 },
        'Social Studies': { obtained: 76, total: 100 },
        Islamiat: { obtained: 88, total: 100 },
      },
    },
  ],
  'Class 10': [
    {
      student_name: 'Muhammad Usman',
      roll_number: '1001',
      class_name: 'Class 10',
      grade: 'A+',
      subjects: {
        Mathematics: { obtained: 96, total: 100 },
        English: { obtained: 91, total: 100 },
        Physics: { obtained: 89, total: 100 },
        Chemistry: { obtained: 94, total: 100 },
        Biology: { obtained: 97, total: 100 },
        Urdu: { obtained: 87, total: 100 },
      },
    },
    {
      student_name: 'Aisha Bibi',
      roll_number: '1002',
      class_name: 'Class 10',
      grade: 'B+',
      subjects: {
        Mathematics: { obtained: 68, total: 100 },
        English: { obtained: 72, total: 100 },
        Physics: { obtained: 65, total: 100 },
        Chemistry: { obtained: 70, total: 100 },
        Biology: { obtained: 75, total: 100 },
        Urdu: { obtained: 80, total: 100 },
      },
    },
  ],
};

export default function DemoPortal() {
  const { templateId } = useParams<{ templateId: string }>();
  const tpl = getTemplate(templateId || 'luxury-gold');
  const accent = tpl.accentColor;

  const [selectedClass, setSelectedClass] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<(typeof DEMO_RESULTS)['Class 9'][0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !selectedClass) return;
    setResult(null);
    setNotFound(false);

    const classResults = DEMO_RESULTS[selectedClass] || [];
    const q = query.trim().toLowerCase();
    const found = classResults.find(
      (r) => r.student_name.toLowerCase().includes(q) || r.roll_number === q
    );

    // For demo: if no exact match, return the first result from that class
    setResult(found || classResults[0] || null);
    if (!found && classResults.length === 0) setNotFound(true);
  }

  function handleCheckAnother() {
    setResult(null);
    setNotFound(false);
    setQuery('');
  }

  const processedResult = useMemo(() => {
    if (!result) return { subjects: [], position: '—', percentage: 0, totalObtained: 0, totalMax: 0 };
    const subjects = Object.entries(result.subjects).map(([name, { obtained, total }]) => ({
      name,
      obtained,
      total,
      percentage: total > 0 ? (obtained / total) * 100 : 0,
    }));
    const totalObtained = subjects.reduce((s, sub) => s + sub.obtained, 0);
    const totalMax = subjects.reduce((s, sub) => s + sub.total, 0);
    return {
      subjects,
      position: '1st',
      percentage: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0,
      totalObtained,
      totalMax,
    };
  }, [result]);

  const btnTextColor = ['glassmorphism', 'minimalist', 'kawaii'].includes(tpl.id) ? '#fff'
    : ['monochrome'].includes(tpl.id) ? '#000' : '#111';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: tpl.background, color: tpl.textPrimary }}>
      {/* Back link */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: accent }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Designs
        </Link>
      </div>

      <header className="pt-4 sm:pt-6 pb-3 sm:pb-4 text-center">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight" style={{ color: accent }}>
            Demo Academy
          </h1>
          <p className="tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 uppercase" style={{ color: tpl.textSecondary }}>
            Student Result Portal
          </p>
          <div
            className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm"
            style={{ borderColor: `${accent}50`, color: accent, background: tpl.cardBg }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
            Annual Examination 2026
          </div>
          <p className="text-[10px] sm:text-xs mt-2 sm:mt-3 italic px-2" style={{ color: tpl.textSecondary }}>
            This is a demo — enter any name or roll number to see a sample result
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 sm:px-4 pb-8 sm:pb-10 max-w-2xl">
        {!result && !notFound ? (
          <Card className="backdrop-blur-sm" style={{ background: tpl.cardBg, borderColor: tpl.cardBorder, borderRadius: tpl.borderRadius }}>
            <CardContent className="p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl text-center flex items-center justify-center gap-2" style={{ color: accent }}>
                <Search className="h-5 w-5" /> Student Result Inquiry
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: tpl.textSecondary }}>Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger style={{ background: tpl.inputBg, borderColor: tpl.cardBorder, color: tpl.textPrimary }}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" style={{ color: tpl.textSecondary }}>Roll Number or Student Name</label>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter roll number or student name"
                    required
                    style={{ background: tpl.inputBg, borderColor: tpl.cardBorder, color: tpl.textPrimary }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={!selectedClass}
                  style={{ background: tpl.buttonGradient, color: btnTextColor }}
                >
                  ✦ View Result
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : notFound ? (
          <Card className="backdrop-blur-sm" style={{ background: tpl.cardBg, borderColor: tpl.cardBorder, borderRadius: tpl.borderRadius }}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto" style={{ background: `${accent}18` }}>
                <Search className="h-6 w-6" style={{ color: accent }} />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold" style={{ color: tpl.textPrimary }}>No Result Found</h3>
                <p className="text-sm mt-1" style={{ color: tpl.textSecondary }}>
                  Try searching for "Ahmed", "Fatima", "Usman", or "Aisha"
                </p>
              </div>
              <Button variant="outline" onClick={handleCheckAnother} className="gap-2" style={{ borderColor: tpl.cardBorder, color: tpl.textPrimary }}>
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </CardContent>
          </Card>
        ) : result ? (
          <div className="space-y-4">
            <Card className="overflow-hidden backdrop-blur-sm" style={{ background: tpl.cardBg, borderColor: tpl.cardBorder, borderRadius: tpl.borderRadius }}>
              <CardContent className="p-0">
                <div className="px-4 sm:px-6 py-3 sm:py-4 text-center" style={{ borderBottom: `1px solid ${tpl.cardBorder}`, background: tpl.tableHeaderBg }}>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em]" style={{ color: tpl.textSecondary }}>Demo Academy</p>
                  <p className="text-[10px] sm:text-xs mt-1" style={{ color: accent }}>Annual Examination 2026</p>
                </div>

                <div className="px-4 sm:px-6 py-3 sm:py-5 grid grid-cols-2 gap-3 sm:gap-4" style={{ borderBottom: `1px solid ${tpl.cardBorder}` }}>
                  <div>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em]" style={{ color: tpl.textSecondary }}>Student</p>
                    <p className="font-display text-lg sm:text-2xl font-bold" style={{ color: tpl.textPrimary }}>{result.student_name}</p>
                    <p className="text-[10px] sm:text-xs mt-1" style={{ color: tpl.textSecondary }}>Roll: {result.roll_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em]" style={{ color: tpl.textSecondary }}>Class</p>
                    <p className="font-display text-lg sm:text-2xl font-bold" style={{ color: tpl.textPrimary }}>{result.class_name}</p>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-3 gap-2 sm:gap-3" style={{ borderBottom: `1px solid ${tpl.cardBorder}` }}>
                  {[
                    { icon: Trophy, label: 'Position', value: processedResult.position },
                    { icon: TrendingUp, label: 'Percentage', value: `${processedResult.percentage.toFixed(2)}%` },
                    { icon: Award, label: 'Marks', value: `${processedResult.totalObtained}/${processedResult.totalMax}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-lg p-2 sm:p-3 text-center" style={{ border: `1px solid ${tpl.cardBorder}`, background: tpl.inputBg }}>
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mx-auto mb-1" style={{ color: accent }} />
                      <p className="font-display text-sm sm:text-lg font-bold leading-tight" style={{ color: tpl.textPrimary }}>{value}</p>
                      <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.18em]" style={{ color: tpl.textSecondary }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: tpl.textSecondary }}>Subject-wise marks</p>
                  <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${tpl.cardBorder}` }}>
                    <table className="w-full text-sm">
                      <thead style={{ background: tpl.tableHeaderBg }}>
                        <tr>
                          <th className="py-2 px-3 text-left text-xs uppercase" style={{ color: tpl.textSecondary }}>Subject</th>
                          <th className="py-2 px-3 text-center text-xs uppercase" style={{ color: tpl.textSecondary }}>Obt</th>
                          <th className="py-2 px-3 text-center text-xs uppercase" style={{ color: tpl.textSecondary }}>Total</th>
                          <th className="py-2 px-3 text-right text-xs uppercase" style={{ color: tpl.textSecondary }}>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResult.subjects.map((subject) => (
                          <tr key={subject.name} style={{ borderTop: `1px solid ${tpl.cardBorder}` }}>
                            <td className="py-2.5 px-3 font-medium" style={{ color: tpl.textPrimary }}>{subject.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono" style={{ color: tpl.textPrimary }}>{subject.obtained}</td>
                            <td className="py-2.5 px-3 text-center font-mono" style={{ color: tpl.textPrimary }}>{subject.total}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold" style={{ color: accent }}>{subject.percentage.toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: `2px solid ${tpl.cardBorder}`, background: tpl.tableHeaderBg }}>
                          <td className="py-2.5 px-3 font-semibold" style={{ color: tpl.textPrimary }}>Total</td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold" style={{ color: tpl.textPrimary }}>{processedResult.totalObtained}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold" style={{ color: tpl.textPrimary }}>{processedResult.totalMax}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold" style={{ color: accent }}>{processedResult.percentage.toFixed(2)}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleCheckAnother} className="w-full font-semibold" style={{ background: tpl.buttonGradient, color: btnTextColor }}>
              <RotateCcw className="h-4 w-4 mr-2" /> Check Another Result
            </Button>
          </div>
        ) : null}
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs" style={{ color: tpl.textSecondary }}>
          Powered by <Link to="/" className="font-medium" style={{ color: accent }}>OnlineResultPortal</Link>
        </p>
      </footer>
    </div>
  );
}
