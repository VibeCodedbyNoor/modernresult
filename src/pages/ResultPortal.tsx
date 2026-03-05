import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, GraduationCap, Printer } from 'lucide-react';

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
  subjects: Record<string, number>;
  total_marks: number;
  grade: string;
}

export default function ResultPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !selectedExam) return;
    setSearching(true);
    setSearched(true);
    setResult(null);
    setNotFound(false);

    // Search by roll number first, then by name
    let { data } = await supabase
      .from('results')
      .select('*')
      .eq('exam_id', selectedExam)
      .ilike('roll_number', query.trim())
      .limit(1);

    if (!data || data.length === 0) {
      const res = await supabase
        .from('results')
        .select('*')
        .eq('exam_id', selectedExam)
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

  const accentStyle = { '--school-accent': school.accent_color } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={accentStyle}>
      {/* Header */}
      <header className="border-b border-border" style={{ backgroundColor: school.accent_color }}>
        <div className="container mx-auto px-4 py-6 text-center">
          {school.logo_url && (
            <img src={school.logo_url} alt={school.name} className="h-16 w-16 mx-auto mb-3 rounded-full object-cover bg-white/20" />
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{school.name}</h1>
          <p className="text-white/80 text-sm mt-1">Online Result Portal</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Search form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Search className="h-5 w-5" /> Check Your Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {exams.length > 1 && (
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
              )}
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter roll number or name"
                required
              />
              <Button type="submit" className="w-full" disabled={searching} style={{ backgroundColor: school.accent_color }}>
                {searching ? 'Searching...' : 'Search Result'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result display */}
        {result && (
          <Card className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Result</CardTitle>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 print:hidden">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium text-foreground">{result.student_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Roll Number</span>
                  <p className="font-mono font-medium text-foreground">{result.roll_number}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(result.subjects).map(([subj, marks]) => (
                    <TableRow key={subj}>
                      <TableCell>{subj}</TableCell>
                      <TableCell className="text-right font-mono">{marks}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold border-t-2">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">{result.total_marks}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="text-center py-3">
                <span className="text-sm text-muted-foreground">Grade: </span>
                <span
                  className="inline-flex px-4 py-1.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: result.grade === 'F' ? 'hsl(0, 84%, 60%)' : school.accent_color }}
                >
                  {result.grade}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {notFound && searched && (
          <Card className="animate-fade-in">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No result found for "<strong>{query}</strong>". Please check your roll number or name.</p>
            </CardContent>
          </Card>
        )}

        {exams.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No published results available yet. Please check back later.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="border-t border-border py-6 mt-12 print:hidden">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Powered by <a href="/" className="text-primary hover:underline">ResultCheck</a>
        </div>
      </footer>
    </div>
  );
}
