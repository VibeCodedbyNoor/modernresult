import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, RotateCcw, Award, TrendingUp, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
}

interface Exam {
  id: string;
  name: string;
}

interface Result {
  id: string;
  student_name: string;
  roll_number: string;
  subjects: Record<string, unknown>;
  total_marks: number;
  grade: string;
  class_name: string;
}

interface SubjectRow {
  name: string;
  obtained: number;
  total: number;
  percentage: number;
}

const NON_SUBJECT_PATTERNS = [
  'total', 'position', 'rank', 'percentage', 'percent', '%age', 'grade', 'result', 'gpa', 'cgpa',
  'status', 'remark', 'remarks', 'avg', 'average', 'division', 'obtained', 'overall', 'marks',
];

const normalizeColumn = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isNonSubjectColumn = (value: string) => {
  const normalized = normalizeColumn(value);
  return NON_SUBJECT_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const getNumeric = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const match = raw.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const parseSubjectValue = (value: unknown): { obtained: number; total: number } => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    const obtained = getNumeric(row.obtained ?? row.obt ?? row.marks ?? row.score ?? row.mark ?? 0);
    const total = getNumeric(row.total ?? row.max ?? row.maximum ?? 100) || 100;
    return { obtained, total };
  }

  const raw = String(value ?? '').trim();
  const fraction = raw.match(/(\d+)\s*\/\s*(\d+)/);
  if (fraction) {
    return { obtained: Number(fraction[1]), total: Number(fraction[2]) || 100 };
  }

  return { obtained: getNumeric(raw), total: 100 };
};

export default function ResultPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const resultCardRef = useRef<HTMLDivElement>(null);
  const downloadCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single();
      if (schoolData) {
        setSchool(schoolData);
        const { data: examData } = await supabase
          .from('exams')
          .select('id, name')
          .eq('school_id', schoolData.id)
          .eq('is_published', true);
        setExams(examData || []);
        if (examData && examData.length > 0) setSelectedExam(examData[0].id);
      }
      setLoading(false);
    }

    load();
  }, [slug]);

  useEffect(() => {
    if (!selectedExam) return;

    async function loadClasses() {
      const { data } = await supabase.from('results').select('class_name').eq('exam_id', selectedExam);
      if (data) {
        const unique = [...new Set(data.map((row) => row.class_name).filter(Boolean))];
        setClasses(unique);
        setSelectedClass('');
      }
    }

    loadClasses();
  }, [selectedExam]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !selectedExam || !selectedClass) return;

    setSearching(true);
    setResult(null);
    setNotFound(false);

    const { data } = await supabase.rpc('fuzzy_search_results', {
      p_exam_id: selectedExam,
      p_class_name: selectedClass,
      p_query: query.trim(),
    });

    if (data && data.length > 0) {
      setResult(data[0]);
    } else {
      setNotFound(true);
    }

    setSearching(false);
  }

  const processedResult = useMemo(() => {
    if (!result) {
      return {
        subjects: [] as SubjectRow[],
        position: '—',
        percentage: 0,
        totalObtained: 0,
        totalMax: 0,
      };
    }

    let position = '—';
    let percentage: number | null = null;
    const subjectRows: SubjectRow[] = [];

    for (const [key, value] of Object.entries(result.subjects || {})) {
      const normalized = normalizeColumn(key);

      if (normalized.includes('position') || normalized.includes('rank')) {
        const parsed = String(value ?? '').trim();
        if (parsed) position = parsed;
        continue;
      }

      if (normalized.includes('percent') || normalized.includes('%age') || normalized === '%') {
        const parsed = getNumeric(value);
        if (parsed > 0) percentage = parsed;
        continue;
      }

      if (isNonSubjectColumn(key)) continue;

      const { obtained, total } = parseSubjectValue(value);
      subjectRows.push({
        name: key,
        obtained,
        total,
        percentage: total > 0 ? (obtained / total) * 100 : 0,
      });
    }

    const totalObtained = subjectRows.reduce((sum, subject) => sum + subject.obtained, 0);
    const totalMax = subjectRows.reduce((sum, subject) => sum + subject.total, 0);
    const computedPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    return {
      subjects: subjectRows,
      position,
      percentage: percentage ?? computedPercentage,
      totalObtained,
      totalMax,
    };
  }, [result]);

  const leftSubjects = processedResult.subjects.slice(0, Math.ceil(processedResult.subjects.length / 2));
  const rightSubjects = processedResult.subjects.slice(Math.ceil(processedResult.subjects.length / 2));

  async function handleDownload() {
    const targetNode = downloadCardRef.current || resultCardRef.current;
    if (!targetNode) return;

    const canvas = await html2canvas(targetNode, {
      backgroundColor: '#0f172a',
      scale: 2,
      useCORS: true,
      windowWidth: targetNode.scrollWidth,
      windowHeight: targetNode.scrollHeight,
    });

    const link = document.createElement('a');
    link.download = `${result?.student_name || 'result'}-marksheet.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function handleCheckAnother() {
    setResult(null);
    setNotFound(false);
    setQuery('');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4 animate-fade-in">
          <CardContent className="p-10 text-center space-y-3">
            <Search className="h-10 w-10 text-muted-foreground mx-auto" />
            <h2 className="font-display text-xl font-semibold">School not found</h2>
            <p className="text-muted-foreground text-sm">The result portal you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accent = school.accent_color || '#d4a017';

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{
        backgroundImage: `radial-gradient(60% 45% at 50% 0%, ${accent}22 0%, transparent 70%)`,
      }}
    >
      <header className="pt-8 pb-4 text-center animate-fade-in">
        <div className="container mx-auto px-4">
          {school.logo_url && (
            <img
              src={school.logo_url}
              alt={school.name}
              className="h-20 w-20 mx-auto mb-4 rounded-full object-cover border border-border"
              style={{ boxShadow: `0 0 40px ${accent}44` }}
            />
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight" style={{ color: accent }}>
            {school.name}
          </h1>
          <p className="text-muted-foreground tracking-[0.4em] text-xs md:text-sm mt-2 uppercase">
            Student Result Portal
          </p>
          {exams.length > 0 && (
            <div
              className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/70 text-sm"
              style={{ borderColor: `${accent}50`, color: accent }}
            >
              <span className="w-2 h-2 rounded-full pulse" style={{ background: accent }} />
              {exams.find((exam) => exam.id === selectedExam)?.name || 'Select Exam'}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pb-10 max-w-2xl">
        {!result && !notFound ? (
          <Card className="animate-enter border-border/70 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8 space-y-5">
              <h2 className="font-display text-xl text-center flex items-center justify-center gap-2" style={{ color: accent }}>
                <Search className="h-5 w-5" /> Student Result Inquiry
              </h2>

              <form onSubmit={handleSearch} className="space-y-4">
                {exams.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Exam</label>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                      <SelectTrigger className="bg-background/70">
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="bg-background/70">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Roll Number or Student Name</label>
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Enter roll number or student name"
                    required
                    className="bg-background/70"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full hover-scale font-semibold"
                  disabled={searching || !selectedClass}
                  style={{
                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {searching ? 'Searching...' : '✦ View Result'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : notFound ? (
          <Card className="animate-enter border-border/70 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">No Result Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't find a result for <strong>{query}</strong> in {selectedClass}.
                </p>
              </div>
              <Button variant="outline" onClick={handleCheckAnother} className="gap-2 hover-scale">
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </CardContent>
          </Card>
        ) : result ? (
          <div className="space-y-4 animate-enter">
            <Card ref={resultCardRef} className="overflow-hidden border-border/70 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="px-6 py-4 text-center border-b border-border" style={{ background: `linear-gradient(135deg, ${accent}18, transparent)` }}>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{school.name}</p>
                  <p className="text-xs mt-1" style={{ color: accent }}>{exams.find((exam) => exam.id === selectedExam)?.name}</p>
                </div>

                <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-border">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Student</p>
                    <p className="font-display text-2xl font-bold text-foreground">{result.student_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Roll: {result.roll_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Class</p>
                    <p className="font-display text-2xl font-bold text-foreground">{result.class_name}</p>
                  </div>
                </div>

                <div className="px-6 py-4 grid grid-cols-3 gap-3 border-b border-border">
                  {[
                    { icon: Trophy, label: 'Position', value: processedResult.position },
                    { icon: TrendingUp, label: 'Percentage', value: `${processedResult.percentage.toFixed(2)}%` },
                    { icon: Award, label: 'Marks', value: `${processedResult.totalObtained}/${processedResult.totalMax || 0}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-background/60 p-3 text-center hover-scale"
                      style={{ boxShadow: `0 0 0 1px ${accent}22 inset` }}
                    >
                      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: accent }} />
                      <p className="font-display text-lg font-bold leading-tight">{value}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Subject-wise marks</p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs uppercase text-muted-foreground">Subject</th>
                          <th className="py-2 px-3 text-center text-xs uppercase text-muted-foreground">Obt</th>
                          <th className="py-2 px-3 text-center text-xs uppercase text-muted-foreground">Total</th>
                          <th className="py-2 px-3 text-right text-xs uppercase text-muted-foreground">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResult.subjects.map((subject) => (
                          <tr key={subject.name} className="border-t border-border/60">
                            <td className="py-2.5 px-3 font-medium">{subject.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{subject.obtained}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{subject.total}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold" style={{ color: accent }}>
                              {subject.percentage.toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/30">
                          <td className="py-2.5 px-3 font-semibold">Total</td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold">{processedResult.totalObtained}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold">{processedResult.totalMax}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold" style={{ color: accent }}>
                            {processedResult.percentage.toFixed(2)}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleDownload}
              className="w-full hover-scale font-semibold"
              style={{
                background: `linear-gradient(90deg, ${accent}, hsl(var(--accent)))`,
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Download Result Card
            </Button>

            <Button variant="outline" onClick={handleCheckAnother} className="w-full hover-scale">
              <RotateCcw className="h-4 w-4 mr-2" /> Check Another Result
            </Button>
          </div>
        ) : null}

        {exams.length === 0 && (
          <Card className="animate-fade-in border-border/70 bg-card/80">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No published results available yet. Please check back later.</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Compact download template (off-screen) */}
      {result && (
        <div className="fixed left-0 top-0 -translate-x-[200vw] pointer-events-none">
          <div
            ref={downloadCardRef}
            className="w-[980px] p-8 rounded-2xl border border-border bg-card text-card-foreground"
            style={{ boxShadow: `0 0 0 1px ${accent}22 inset` }}
          >
            <div className="text-center pb-4 border-b border-border">
              <h2 className="font-display text-3xl font-bold" style={{ color: accent }}>{school.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{exams.find((exam) => exam.id === selectedExam)?.name} — {result.class_name}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-b border-border text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Student</p>
                <p className="font-display text-2xl font-bold">{result.student_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Roll</p>
                <p className="font-mono text-xl font-semibold">{result.roll_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Position / Percentage</p>
                <p className="font-display text-xl font-bold">
                  {processedResult.position} • {processedResult.percentage.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {[leftSubjects, rightSubjects].map((list, index) => (
                <table key={index} className="w-full text-sm border border-border rounded-lg overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs uppercase text-muted-foreground">Subject</th>
                      <th className="py-2 px-3 text-center text-xs uppercase text-muted-foreground">Obt</th>
                      <th className="py-2 px-3 text-center text-xs uppercase text-muted-foreground">Total</th>
                      <th className="py-2 px-3 text-right text-xs uppercase text-muted-foreground">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((subject) => (
                      <tr key={subject.name} className="border-t border-border/60">
                        <td className="py-2 px-3">{subject.name}</td>
                        <td className="py-2 px-3 text-center font-mono">{subject.obtained}</td>
                        <td className="py-2 px-3 text-center font-mono">{subject.total}</td>
                        <td className="py-2 px-3 text-right font-mono" style={{ color: accent }}>{subject.percentage.toFixed(0)}%</td>
                      </tr>
                    ))}
                    {list.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">No subjects</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-end gap-6 text-lg font-semibold">
              <span>Total: {processedResult.totalObtained}/{processedResult.totalMax}</span>
              <span style={{ color: accent }}>Grade: {result.grade}</span>
            </div>
          </div>
        </div>
      )}

      <footer className="py-4 text-center print:hidden">
        <p className="text-xs text-muted-foreground">
          Powered by <a href="/" className="story-link font-medium" style={{ color: accent }}>ResultCheck</a>
        </p>
      </footer>
    </div>
  );
}
