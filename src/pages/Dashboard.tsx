import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Upload, Link as LinkIcon, LogOut, Eye, Trash2, School, Settings } from 'lucide-react';

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
  created_at: string;
  is_published: boolean;
}

interface Result {
  id: string;
  student_name: string;
  roll_number: string;
  subjects: Record<string, number>;
  total_marks: number;
  grade: string;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('');
  const [accentColor, setAccentColor] = useState('#6C3CE0');

  // New exam form
  const [newExamName, setNewExamName] = useState('');
  const [examDialogOpen, setExamDialogOpen] = useState(false);

  // CSV upload
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [sheetsLink, setSheetsLink] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) fetchSchool();
  }, [user, authLoading]);

  async function fetchSchool() {
    const { data } = await supabase.from('schools').select('*').eq('owner_id', user!.id).single();
    if (data) {
      setSchool(data);
      fetchExams(data.id);
    }
    setLoading(false);
  }

  async function fetchExams(schoolId: string) {
    const { data } = await supabase.from('exams').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
    setExams(data || []);
  }

  async function fetchResults(examId: string) {
    setSelectedExam(examId);
    const { data } = await supabase.from('results').select('*').eq('exam_id', examId).order('roll_number');
    setResults(data || []);
  }

  async function handleSetupSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const slug = schoolSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const { data, error } = await supabase.from('schools').insert({
      owner_id: user.id,
      name: schoolName,
      slug,
      accent_color: accentColor,
    }).select().single();
    if (error) {
      toast.error(error.message);
    } else {
      setSchool(data);
      toast.success('School created!');
    }
  }

  async function handleCreateExam() {
    if (!school || !newExamName) return;
    const { error } = await supabase.from('exams').insert({
      school_id: school.id,
      name: newExamName,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Exam created!');
      setNewExamName('');
      setExamDialogOpen(false);
      fetchExams(school.id);
    }
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      toast.error('CSV must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rollIdx = headers.findIndex(h => h.toLowerCase().includes('roll'));
    const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
    const subjectHeaders = headers.filter((_, i) => i !== rollIdx && i !== nameIdx);

    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const subjects: Record<string, number> = {};
      let total = 0;
      subjectHeaders.forEach(subj => {
        const idx = headers.indexOf(subj);
        const marks = parseInt(cols[idx]) || 0;
        subjects[subj] = marks;
        total += marks;
      });
      const avg = total / subjectHeaders.length;
      const grade = avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';

      return {
        exam_id: selectedExam,
        roll_number: cols[rollIdx] || '',
        student_name: cols[nameIdx] || '',
        subjects,
        total_marks: total,
        grade,
      };
    });

    const { error } = await supabase.from('results').insert(rows);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${rows.length} results uploaded!`);
      setCsvDialogOpen(false);
      fetchResults(selectedExam);
    }
  }

  async function handleDeleteResult(id: string) {
    const { error } = await supabase.from('results').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('Result deleted');
    }
  }

  async function handleTogglePublish(examId: string, currentStatus: boolean) {
    const { error } = await supabase.from('exams').update({ is_published: !currentStatus }).eq('id', examId);
    if (error) {
      toast.error(error.message);
    } else {
      setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, is_published: !currentStatus } : ex));
      toast.success(!currentStatus ? 'Exam published!' : 'Exam unpublished');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Setup wizard if no school yet
  if (!school) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-lg animate-fade-in">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                <School className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Set up your school</CardTitle>
              <CardDescription>Tell us about your institution to create your result portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetupSchool} className="space-y-4">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={schoolName} onChange={e => { setSchoolName(e.target.value); setSchoolSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="Greenfield Academy" required />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="whitespace-nowrap">/results/</span>
                    <Input value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)} placeholder="greenfield-academy" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 w-14 rounded cursor-pointer border border-input" />
                    <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create School Portal</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-primary">ResultCheck</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">{school.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/results/${school.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> View Portal
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="exams">
          <TabsList>
            <TabsTrigger value="exams">Exams & Results</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6 mt-6">
            {/* Exam selector + create button */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Select value={selectedExam || ''} onValueChange={val => fetchResults(val)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name} {ex.is_published ? '✓' : '(draft)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Exam</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Create New Exam</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Exam Name</Label>
                        <Input value={newExamName} onChange={e => setNewExamName(e.target.value)} placeholder="e.g. Mid-Term 2026" />
                      </div>
                      <Button onClick={handleCreateExam} className="w-full">Create Exam</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {selectedExam && (
              <>
                {/* Actions bar */}
                <div className="flex gap-2 flex-wrap">
                  <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Upload className="h-3.5 w-3.5" /> Upload CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display">Upload Results CSV</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          CSV must have columns: <strong>Roll Number</strong>, <strong>Name</strong>, and subject columns with marks.
                        </p>
                        <Input type="file" accept=".csv" onChange={handleCsvUpload} />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(selectedExam, exams.find(e => e.id === selectedExam)?.is_published || false)}
                    className="gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {exams.find(e => e.id === selectedExam)?.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>

                {/* Results table */}
                {results.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono">{r.roll_number}</TableCell>
                              <TableCell>{r.student_name}</TableCell>
                              <TableCell>{r.total_marks}</TableCell>
                              <TableCell>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${r.grade === 'F' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                                  {r.grade}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteResult(r.id)} className="h-8 w-8">
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No results yet. Upload a CSV to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!selectedExam && exams.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Plus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Create your first exam to start uploading results.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Settings className="h-5 w-5" /> School Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Public URL</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {window.location.origin}/results/{school.slug}
                    </code>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input value={school.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded" style={{ backgroundColor: school.accent_color }} />
                    <span className="text-sm text-muted-foreground">{school.accent_color}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
