import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, RotateCcw, Star, TrendingUp, Award } from 'lucide-react';
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
  subjects: any;
  total_marks: number;
  grade: string;
  class_name: string;
}

export default function ResultPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single();
      if (schoolData) {
        setSchool(schoolData);
        const { data: examData } = await supabase.from('exams').select('id, name').eq('school_id', schoolData.id).eq('is_published', true);
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
      const { data } = await supabase
        .from('results')
        .select('class_name')
        .eq('exam_id', selectedExam);
      if (data) {
        const unique = [...new Set(data.map(r => r.class_name).filter(Boolean))];
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
    setSearched(true);
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

  async function handleDownload() {
    if (!resultCardRef.current) return;
    const canvas = await html2canvas(resultCardRef.current, {
      backgroundColor: '#0c1220',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = `${result?.student_name || 'result'}-result.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  function handleCheckAnother() {
    setResult(null);
    setSearched(false);
    setNotFound(false);
    setQuery('');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <div className="text-center">
          <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-200 mb-2">School not found</h2>
          <p className="text-gray-500">The result portal you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const accent = school.accent_color || '#d4a017';
  const subjects = result ? Object.entries(result.subjects as Record<string, number>) : [];
  const totalMaxMarks = subjects.length * 100;
  const percentage = totalMaxMarks > 0 ? ((result?.total_marks || 0) / totalMaxMarks * 100).toFixed(2) : '0';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)' }}>
      {/* Header */}
      <header className="pt-8 pb-4 text-center relative">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
            style={{ background: accent }}
          />
        </div>
        <div className="relative container mx-auto px-4">
          {school.logo_url && (
            <img
              src={school.logo_url}
              alt={school.name}
              className="h-20 w-20 mx-auto mb-4 rounded-full object-cover"
              style={{ boxShadow: `0 0 30px ${accent}40` }}
            />
          )}
          <h1
            className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: accent }}
          >
            {school.name}
          </h1>

          {exams.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm"
              style={{ borderColor: `${accent}40`, color: accent }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
              {exams.find(e => e.id === selectedExam)?.name || 'Select Exam'}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 pb-8 max-w-lg">
        {!result && !notFound ? (
          /* Search Form */
          <div
            className="rounded-2xl p-6 space-y-5 mt-4"
            style={{
              background: 'linear-gradient(145deg, #141c2e, #111827)',
              border: `1px solid ${accent}25`,
              boxShadow: `0 0 40px ${accent}08`,
            }}
          >
            <h2 className="text-center flex items-center justify-center gap-2">
              <Search className="h-5 w-5" style={{ color: accent }} />
              <span className="font-display text-lg font-semibold" style={{ color: accent }}>
                Student Result Inquiry
              </span>
            </h2>

            <form onSubmit={handleSearch} className="space-y-4">
              {exams.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400">Exam</label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger className="border-gray-700 bg-gray-800/80 text-gray-200 focus:ring-0" style={{ borderColor: `${accent}30` }}>
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {exams.map(ex => (
                        <SelectItem key={ex.id} value={ex.id} className="text-gray-200 focus:bg-gray-700">{ex.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-400">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="border-gray-700 bg-gray-800/80 text-gray-200 focus:ring-0" style={{ borderColor: `${accent}30` }}>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {classes.map(c => (
                      <SelectItem key={c} value={c} className="text-gray-200 focus:bg-gray-700">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-400">Student Name</label>
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Enter student name"
                  required
                  className="border-gray-700 bg-gray-800/80 text-gray-200 placeholder:text-gray-500 focus-visible:ring-0"
                  style={{ borderColor: `${accent}30` }}
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold text-base py-5 transition-all duration-200"
                disabled={searching || !selectedClass}
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: '#000',
                  boxShadow: `0 4px 20px ${accent}40`,
                }}
              >
                {searching ? 'Searching...' : '✦ View Result'}
              </Button>
            </form>
          </div>
        ) : notFound ? (
          /* Not Found */
          <div
            className="rounded-2xl p-8 text-center space-y-4 mt-4 animate-fade-in"
            style={{
              background: 'linear-gradient(145deg, #141c2e, #111827)',
              border: '1px solid #2a1a1a',
            }}
          >
            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#2a1a1a' }}>
              <Search className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-200 text-lg">No Result Found</h3>
              <p className="text-gray-500 text-sm mt-1">
                We couldn't find a result for "<strong className="text-gray-300">{query}</strong>" in {selectedClass}.
              </p>
            </div>
            <Button onClick={handleCheckAnother} variant="outline" className="gap-1.5 border-gray-700 text-gray-300 hover:bg-gray-800">
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : result ? (
          /* Result Card */
          <div className="space-y-4 animate-fade-in mt-4">
            <div
              ref={resultCardRef}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #141c2e, #111827)',
                border: `1px solid ${accent}25`,
              }}
            >
              {/* Card Header */}
              <div
                className="px-6 py-3 text-center"
                style={{
                  background: `linear-gradient(135deg, ${accent}15, transparent)`,
                  borderBottom: `1px solid ${accent}20`,
                }}
              >
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  {school.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: accent }}>
                  {exams.find(e => e.id === selectedExam)?.name}
                </p>
              </div>

              {/* Student Info */}
              <div className="px-6 py-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Student</span>
                  <p className="text-2xl font-display font-bold text-gray-100">{result.student_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">Class</span>
                  <p className="text-2xl font-display font-bold text-gray-100">{result.class_name}</p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                {[
                  { icon: Star, label: 'GRADE', value: result.grade },
                  { icon: TrendingUp, label: 'PERCENTAGE', value: `${percentage}%` },
                  { icon: Award, label: 'MARKS', value: `${result.total_marks}/${totalMaxMarks}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: `linear-gradient(145deg, ${accent}15, ${accent}08)`,
                      border: `1px solid ${accent}20`,
                    }}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: accent }} />
                    <p className="text-lg font-bold text-gray-100 font-display">{value}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Subject Table */}
              <div className="px-6 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subject-Wise Marks</p>
                <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${accent}15` }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: `${accent}10` }}>
                        <th className="text-left py-2.5 px-3 text-gray-400 font-medium text-xs uppercase">Subject</th>
                        <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs uppercase">OBT</th>
                        <th className="text-center py-2.5 px-3 text-gray-400 font-medium text-xs uppercase">Total</th>
                        <th className="text-right py-2.5 px-3 text-gray-400 font-medium text-xs uppercase">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(([subj, marks], i) => {
                        const pct = Math.round((Number(marks) / 100) * 100);
                        return (
                          <tr key={subj} style={{ borderTop: `1px solid ${accent}08` }}>
                            <td className="py-2.5 px-3 text-gray-200 font-medium">{subj}</td>
                            <td className="py-2.5 px-3 text-center text-gray-300 font-mono font-bold">{String(marks)}</td>
                            <td className="py-2.5 px-3 text-center text-gray-500">100</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: accent }}>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `2px solid ${accent}30`, background: `${accent}08` }}>
                        <td className="py-2.5 px-3 font-bold" style={{ color: accent }}>Total</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold" style={{ color: accent }}>{result.total_marks}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold" style={{ color: accent }}>{totalMaxMarks}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold" style={{ color: accent }}>{percentage}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Spacer for download card */}
              <div className="h-4" />
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              className="w-full font-semibold text-base py-5 rounded-xl transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${accent}, #00c6ff)`,
                color: '#000',
                boxShadow: `0 4px 20px ${accent}40`,
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Download Result Card
            </Button>

            <Button
              onClick={handleCheckAnother}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl py-5"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Check Another Result
            </Button>
          </div>
        ) : null}

        {exams.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center mt-4"
            style={{
              background: 'linear-gradient(145deg, #141c2e, #111827)',
              border: '1px solid #1f2937',
            }}
          >
            <p className="text-gray-500">No published results available yet. Please check back later.</p>
          </div>
        )}
      </div>

      <footer className="py-4 text-center print:hidden">
        <p className="text-xs text-gray-600">
          Powered by <a href="/" className="hover:underline font-medium" style={{ color: accent }}>ResultCheck</a>
        </p>
      </footer>
    </div>
  );
}
