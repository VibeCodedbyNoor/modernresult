import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SEO from '@/components/SEO';
import { normalizeSettings, computeDerived } from '@/lib/examCalculations';

interface RowVM {
  rank: number;
  name: string;
  className: string;
  percentage: string;
  pctVal: number;
  grade: string;
  status: 'PASS' | 'FAIL';
}

export default function MeritList() {
  const { slug } = useParams<{ slug: string }>();
  const [sp] = useSearchParams();
  const examIdParam = sp.get('exam');

  const [school, setSchool] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [rows, setRows] = useState<RowVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single();
      if (!schoolData) { setLoading(false); return; }
      setSchool(schoolData);

      let examRow: any = null;
      if (examIdParam) {
        const { data } = await supabase.from('exams').select('*').eq('id', examIdParam).eq('school_id', schoolData.id).maybeSingle();
        examRow = data;
      }
      if (!examRow) {
        const { data } = await supabase.from('exams').select('*')
          .eq('school_id', schoolData.id).eq('is_published', true)
          .order('created_at', { ascending: false }).limit(1);
        examRow = data?.[0];
      }
      setExam(examRow);

      if (examRow) {
        const settings = normalizeSettings((examRow as any).exam_settings);
        const { data: results } = await supabase.from('results').select('*').eq('exam_id', examRow.id);
        const list = (results || []).map((r: any) => {
          const raw = r.subjects || {};
          let subjects: any[] = [];
          if (Array.isArray(raw)) subjects = raw;
          else subjects = Object.entries(raw).filter(([k]) => k !== 'Position').map(([name, v]: any) => ({
            subject: name,
            obtained_marks: typeof v === 'object' ? Number(v.obtained) || 0 : Number(v) || 0,
            total_marks: typeof v === 'object' ? Number(v.total) || 100 : 100,
          }));
          const derived = computeDerived({ subjects, raw: raw, position: typeof raw === 'object' && !Array.isArray(raw) ? raw.Position : undefined }, settings);
          return { name: r.student_name, className: r.class_name, percentage: derived.percentage, pctVal: derived.percentageValue, grade: derived.grade, status: derived.status };
        });
        list.sort((a, b) => b.pctVal - a.pctVal);
        let prev = -1, prevRank = 0;
        const ranked: RowVM[] = list.map((x, i) => {
          if (x.pctVal !== prev) prevRank = i + 1;
          prev = x.pctVal;
          return { ...x, rank: prevRank };
        });
        setRows(ranked);
      }
      setLoading(false);
    })();
  }, [slug, examIdParam]);

  const classNames = useMemo(() => Array.from(new Set(rows.map(r => r.className))).filter(Boolean), [rows]);
  const filtered = rows.filter(r =>
    (classFilter === 'all' || r.className === classFilter) &&
    (!query || r.name.toLowerCase().includes(query.toLowerCase()))
  );
  const top3 = filtered.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading merit list…</div>;
  if (!school) return <div className="min-h-screen flex items-center justify-center">School not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Merit List — ${school.name}`} description={`Top students of ${exam?.name || 'latest exam'} at ${school.name}.`} path={`/${slug}/merit`} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center gap-3">
          {school.logo_url && <img src={school.logo_url} alt="" className="h-12 w-12 rounded object-cover" />}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{school.name}</h1>
            <p className="text-sm text-muted-foreground">Merit List {exam ? `— ${exam.name}` : ''}</p>
          </div>
          <Link to={`/results/${slug}`} className="ml-auto text-sm text-primary hover:underline">← Back to portal</Link>
        </header>

        {top3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {top3.map((s, i) => (
              <Card key={i} className={i === 0 ? 'border-amber-400/60 shadow-lg' : ''}>
                <CardContent className="p-4 text-center space-y-1">
                  <div className="text-4xl">{medals[i]}</div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.className}</div>
                  <div className="text-lg font-bold text-primary">{s.percentage}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="sm:max-w-xs" />
          {classNames.length > 0 && (
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classNames.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold">{r.rank}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.className}</TableCell>
                    <TableCell className="text-right font-medium">{r.percentage}</TableCell>
                    <TableCell><Badge variant="secondary">{r.grade}</Badge></TableCell>
                    <TableCell><Badge variant={r.status === 'PASS' ? 'default' : 'destructive'}>{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students to show.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
