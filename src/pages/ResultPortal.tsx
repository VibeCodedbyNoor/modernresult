import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, GraduationCap, Download, RotateCcw } from 'lucide-react';
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

  // Fetch distinct classes when exam changes
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

    let { data } = await supabase
      .from('results')
      .select('*')
      .eq('exam_id', selectedExam)
      .eq('class_name', selectedClass)
      .ilike('roll_number', query.trim())
      .limit(1);

    if (!data || data.length === 0) {
      const res = await supabase
        .from('results')
        .select('*')
        .eq('exam_id', selectedExam)
        .eq('class_name', selectedClass)
        .ilike('student_name', `%${query.trim()}%`)
        .limit(1);
      data = res.data;
    }

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
      backgroundColor: '#ffffff',
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">School not found</h2>
            <p className="text-muted-foreground">The result portal you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjects = result ? Object.entries(result.subjects as Record<string, number>) : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, ${school.accent_color}15, ${school.accent_color}05)` }}>
      {/* Header */}
      <header className="py-8 text-center">
        <div className="container mx-auto px-4">
          {school.logo_url && (
            <img src={school.logo_url} alt={school.name} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover shadow-md border-2 border-white" />
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: school.accent_color }}>
            {school.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Student Result Portal</p>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 pb-8 max-w-md">
        {!result && !notFound ? (
          /* Search Form */
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-display text-lg font-semibold text-center text-foreground">
                Check Your Result
              </h2>

              <form onSubmit={handleSearch} className="space-y-4">
                {exams.length > 1 && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Select Exam</label>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Select Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">Roll Number or Name</label>
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Enter roll number or student name"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-white font-semibold"
                  disabled={searching || !selectedClass}
                  style={{ backgroundColor: school.accent_color }}
                >
                  {searching ? 'Searching...' : 'View Result'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : notFound ? (
          /* Not Found */
          <Card className="shadow-lg border-0 animate-fade-in">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Search className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground text-lg">No Result Found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  We couldn't find a result for "<strong>{query}</strong>" in {selectedClass}. Please check your details.
                </p>
              </div>
              <Button onClick={handleCheckAnother} variant="outline" className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </CardContent>
          </Card>
        ) : result ? (
          /* Result Card */
          <div className="space-y-4 animate-fade-in">
            <div ref={resultCardRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="px-6 py-4 text-center text-white" style={{ backgroundColor: school.accent_color }}>
                <h2 className="font-display font-bold text-lg">{school.name}</h2>
                <p className="text-white/80 text-xs mt-0.5">
                  {exams.find(e => e.id === selectedExam)?.name} — {result.class_name}
                </p>
              </div>

              {/* Student Info */}
              <div className="px-6 py-4 border-b border-border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Student Name</span>
                    <p className="font-semibold text-foreground">{result.student_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Roll Number</span>
                    <p className="font-mono font-semibold text-foreground">{result.roll_number}</p>
                  </div>
                </div>
              </div>

              {/* Marks Table */}
              <div className="px-6 py-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase">Subject</th>
                      <th className="text-right py-2 text-muted-foreground font-medium text-xs uppercase">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(([subj, marks]) => (
                      <tr key={subj} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{subj}</td>
                        <td className="py-2 text-right font-mono font-medium text-foreground">{String(marks)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td className="py-2 font-semibold text-foreground">Total</td>
                      <td className="py-2 text-right font-mono font-bold text-foreground">{result.total_marks}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Grade Badge */}
              <div className="px-6 py-4 text-center">
                <span
                  className="inline-flex px-5 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: result.grade === 'F' ? 'hsl(0, 84%, 60%)' : school.accent_color }}
                >
                  Grade: {result.grade}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className="flex-1 gap-1.5 text-white"
                style={{ backgroundColor: school.accent_color }}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button onClick={handleCheckAnother} variant="outline" className="flex-1 gap-1.5">
                <RotateCcw className="h-4 w-4" /> Check Another
              </Button>
            </div>
          </div>
        ) : null}

        {exams.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No published results available yet. Please check back later.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="py-4 text-center print:hidden">
        <p className="text-xs text-muted-foreground">
          Powered by <a href="/" className="text-primary hover:underline font-medium">ResultCheck</a>
        </p>
      </footer>
    </div>
  );
}
