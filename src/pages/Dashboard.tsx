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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Upload, Link as LinkIcon, LogOut, Eye, Trash2, School, Settings, FileSpreadsheet, Check, Palette, Coins, Zap, Gift, Clock, MessageCircle, CreditCard, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { resultTemplates, getTemplate } from '@/lib/resultTemplates';
import BulkMarksheetGenerator from '@/components/BulkMarksheetGenerator';

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  result_template: string;
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
  subjects: any;
  total_marks: number;
  grade: string;
  class_name: string;
}

const NON_SUBJECT_PATTERNS = [
  'total', 'position', 'percentage', 'percent', '%age', 'rank', 'grade', 'result',
  'status', 'remarks', 'remark', 'division', 'gpa', 'cgpa', 'average',
  'avg', 'pass', 'fail', 'obtained', 'max', 'minimum', 'maximum',
  'sr', 'serial', 'class', 'section', 'father', 'mother', 'parent',
  'address', 'phone', 'mobile', 'email', 'dob', 'date', 'gender', 'age',
  'no.', 'no', 's.no', 's.r', 'reg'
];

const normalizeColumn = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isNonSubjectColumn = (value: string) => {
  const normalized = normalizeColumn(value);
  if (!normalized) return true;
  return NON_SUBJECT_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const parseMarksValue = (value: unknown) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Setup form state
  const [schoolName, setSchoolName] = useState('');
  const [schoolSlug, setSchoolSlug] = useState('');
  const [accentColor, setAccentColor] = useState('#6C3CE0');

  // New exam form
  const [newExamName, setNewExamName] = useState('');
  const [examDialogOpen, setExamDialogOpen] = useState(false);

  // Upload dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Column mapping state
  const [columnMappingOpen, setColumnMappingOpen] = useState(false);
  const [parsedSheets, setParsedSheets] = useState<{ sheetName: string; data: Record<string, any>[] }[]>([]);
  const [allHeaders, setAllHeaders] = useState<string[]>([]);
  const [selectedRollKey, setSelectedRollKey] = useState('');
  const [selectedNameKey, setSelectedNameKey] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, boolean>>({});

  // Class filter
  const [classFilter, setClassFilter] = useState<string>('all');

  // Credits state
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

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
      fetchCredits(data.id);
    }
    setLoading(false);
  }

  async function fetchCredits(schoolId: string) {
    const { data: creditData } = await supabase.from('school_credits').select('balance').eq('school_id', schoolId).single();
    if (creditData) setCreditBalance(creditData.balance);

    const { data: txData } = await supabase.from('credit_transactions').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(50);
    setTransactions(txData || []);
  }

  async function fetchExams(schoolId: string) {
    const { data } = await supabase.from('exams').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
    setExams(data || []);
  }

  async function fetchResults(examId: string) {
    setSelectedExam(examId);
    setClassFilter('all');
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheets: { sheetName: string; data: Record<string, any>[] }[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
        if (jsonData.length > 0) {
          sheets.push({ sheetName, data: jsonData });
        }
      }

      if (sheets.length === 0) {
        toast.error('No data found in the file');
        return;
      }

      // Collect headers across all sheets so mapping is stable for merged uploads
      const headers = Array.from(
        new Set(
          sheets.flatMap(({ data }) => Object.keys(data[0] || {})).filter((header) => header.trim())
        )
      );
      const rollKey = headers.find((h) => normalizeColumn(h).includes('roll')) || headers[0] || '';
      const nameKey = headers.find((h) => normalizeColumn(h).includes('name')) || headers[1] || '';

      const subjectDefaults: Record<string, boolean> = {};
      for (const h of headers) {
        if (h === rollKey || h === nameKey) continue;
        subjectDefaults[h] = !isNonSubjectColumn(h);
      }

      setParsedSheets(sheets);
      setAllHeaders(headers);
      setSelectedRollKey(rollKey);
      setSelectedNameKey(nameKey);
      setSelectedSubjects(subjectDefaults);
      setUploadDialogOpen(false);
      setColumnMappingOpen(true);
    } catch (err: any) {
      toast.error('Failed to parse file: ' + err.message);
    }
  }

  async function handleConfirmUpload() {
    if (!selectedExam) return;
    if (!selectedRollKey || !selectedNameKey || selectedRollKey === selectedNameKey) {
      toast.error('Please choose different Roll Number and Student Name columns');
      return;
    }

    const subjectKeys = Object.entries(selectedSubjects)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key)
      .filter((key) => !isNonSubjectColumn(key));

    if (subjectKeys.length === 0) {
      toast.error('Please select at least one valid subject column');
      return;
    }

    setUploading(true);
    try {
      const allRows: any[] = [];
      for (const { sheetName, data } of parsedSheets) {
        for (const row of data) {
          const subjects: Record<string, number> = {};
          let total = 0;

          for (const subj of subjectKeys) {
            const marks = parseMarksValue(row[subj]);
            subjects[subj] = marks;
            total += marks;
          }

          const avg = subjectKeys.length > 0 ? total / subjectKeys.length : 0;
          const grade = avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';

          allRows.push({
            exam_id: selectedExam,
            roll_number: String(row[selectedRollKey] || '').trim(),
            student_name: String(row[selectedNameKey] || '').trim(),
            subjects,
            total_marks: total,
            grade,
            class_name: sheetName,
          });
        }
      }

      const validRows = allRows.filter((row) => row.roll_number && row.student_name);

      if (validRows.length === 0) {
        toast.error('No valid student rows found after mapping');
        return;
      }

      const { error } = await supabase.from('results').insert(validRows);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`${validRows.length} results uploaded from ${parsedSheets.length} class(es)!`);
        setColumnMappingOpen(false);
        setParsedSheets([]);
        fetchResults(selectedExam);
      }
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
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

  const classNames = [...new Set(results.map(r => r.class_name).filter(Boolean))];
  const filteredResults = classFilter === 'all' ? results : results.filter(r => r.class_name === classFilter);

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
            <TabsTrigger value="credits">Credits</TabsTrigger>
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
                <div className="flex gap-2 flex-wrap items-center">
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> Upload Excel / CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display">Upload Results</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Upload an <strong>Excel (.xlsx)</strong> or <strong>CSV</strong> file. Each sheet in Excel will be treated as a separate <strong>class</strong>.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Each sheet must have columns: <strong>Roll Number</strong>, <strong>Name</strong>, and subject columns with marks.
                        </p>
                        <Input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
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

                  {classNames.length > 0 && (
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-40 ml-auto">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classNames.map(cn => (
                          <SelectItem key={cn} value={cn}>{cn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Results table */}
                {filteredResults.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono">{r.roll_number}</TableCell>
                              <TableCell>{r.student_name}</TableCell>
                              <TableCell>{r.class_name}</TableCell>
                              <TableCell>{r.total_marks}</TableCell>
                              <TableCell>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${r.grade === 'F' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
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
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No results yet. Upload an Excel or CSV file to get started.</p>
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

          <TabsContent value="credits" className="mt-6 space-y-6">
            {/* Balance Card */}
            <Card className="max-w-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Credits</p>
                    <p className="text-4xl font-display font-bold text-foreground">{creditBalance ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">1 credit = 1 student result check</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buy Credits */}
            <Card className="max-w-2xl border-primary/20">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Buy Credits
                </CardTitle>
                <CardDescription className="text-base">
                  A printed DMC costs over <strong>Rs. 50</strong> — go digital for just <strong>Rs. 9 per student</strong>. Save 80%+ compared to traditional result printing!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 50 credits */}
                  <div className="rounded-xl border border-border p-4 text-center space-y-1">
                    <p className="text-2xl font-display font-bold text-foreground">50</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    <p className="text-lg font-semibold text-primary">PKR 450</p>
                    <p className="text-[10px] text-muted-foreground">Rs. 9/credit</p>
                  </div>
                  {/* 100 credits */}
                  <div className="rounded-xl border border-border p-4 text-center space-y-1">
                    <p className="text-2xl font-display font-bold text-foreground">100</p>
                    <p className="text-xs text-muted-foreground">credits</p>
                    <p className="text-lg font-semibold text-primary">PKR 900</p>
                    <p className="text-[10px] text-muted-foreground">Rs. 9/credit</p>
                  </div>
                  {/* 500 credits + bonus */}
                  <div className="rounded-xl border-2 border-primary p-4 text-center space-y-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                      <Gift className="h-2.5 w-2.5" /> LIMITED TIME
                    </div>
                    <p className="text-2xl font-display font-bold text-foreground">500</p>
                    <p className="text-xs text-primary font-semibold">+ 50 FREE bonus!</p>
                    <p className="text-lg font-semibold text-primary">PKR 4,500</p>
                    <p className="text-[10px] text-muted-foreground">Rs. 8.18/credit effective</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Payment Details</p>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Easypaisa:</strong> 03479104843</p>
                    <p><strong className="text-foreground">JazzCash:</strong> 03479104843</p>
                    <p><strong className="text-foreground">Account Name:</strong> Muhammad Irfan</p>
                  </div>
                  <div className="pt-3 border-t border-border space-y-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Send payment & screenshot via WhatsApp — credits added within 1 hour
                    </p>
                    <a
                      href={`https://wa.me/923479104843?text=${encodeURIComponent(
                        `Assalam o Alaikum! 🎓\n\nI have purchased credits on ResultCheck.\n\n📧 My Email: ${user?.email || ''}\n🏫 School: ${school?.name || ''}\n💰 Package: [50 / 100 / 500 credits]\n\nPayment screenshot is attached. Please add my credits. JazakAllah! 🙏`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                        <MessageCircle className="h-4 w-4" />
                        Send Payment Screenshot via WhatsApp
                      </Button>
                    </a>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Click the button above after payment — your email & school info will be auto-filled. Just attach the screenshot and send!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Credits Used */}
            {transactions.length > 0 && (() => {
              // Group result_check transactions by date
              const dailyUsage: Record<string, number> = {};
              transactions.forEach(tx => {
                if (tx.type === 'result_check') {
                  const date = new Date(tx.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
                  dailyUsage[date] = (dailyUsage[date] || 0) + Math.abs(tx.amount);
                }
              });
              const dailyEntries = Object.entries(dailyUsage);
              if (dailyEntries.length === 0) return null;
              return (
                <Card className="max-w-2xl">
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" /> Daily Credits Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Credits Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dailyEntries.map(([date, count]) => (
                          <TableRow key={date}>
                            <TableCell className="text-sm text-foreground">{date}</TableCell>
                            <TableCell className="text-right font-mono text-sm font-semibold text-muted-foreground">
                              {count}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
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

            {/* Result Design Template Picker */}
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> Choose Your Result Portal Design
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick a style below — this is exactly how students will see your result portal. Just click to apply!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {resultTemplates.map((template) => {
                  const isSelected = (school.result_template || 'luxury-gold') === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={async () => {
                        const { error } = await supabase
                          .from('schools')
                          .update({ result_template: template.id })
                          .eq('id', school.id);
                        if (error) {
                          toast.error(error.message);
                        } else {
                          setSchool({ ...school, result_template: template.id });
                          toast.success(`Design changed to "${template.name}"`);
                        }
                      }}
                      className={`group relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 shadow-md'
                          : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
                      {/* Mini portal preview */}
                      <div
                        className="aspect-[4/3] p-3 flex flex-col"
                        style={{ background: template.background }}
                      >
                        {/* Mini header */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ background: template.accentColor, opacity: 0.8 }}
                          />
                          <div
                            className="h-1.5 w-16 rounded-full"
                            style={{ background: template.textPrimary, opacity: 0.6 }}
                          />
                        </div>

                        {/* Mini card */}
                        <div
                          className="flex-1 rounded-lg border p-2.5 flex flex-col gap-1.5"
                          style={{
                            background: template.cardBg,
                            borderColor: template.cardBorder,
                            borderRadius: template.borderRadius || '0.5rem',
                            backdropFilter: template.id === 'glassmorphism' ? 'blur(8px)' : undefined,
                          }}
                        >
                          {/* Title line */}
                          <div
                            className="h-2 w-3/5 rounded-full"
                            style={{ background: template.accentColor, opacity: 0.8 }}
                          />
                          {/* Input mock */}
                          <div
                            className="h-4 w-full rounded"
                            style={{
                              background: template.inputBg,
                              border: `1px solid ${template.cardBorder}`,
                              borderRadius: template.borderRadius || '0.25rem',
                            }}
                          />
                          {/* Another input mock */}
                          <div
                            className="h-4 w-full rounded"
                            style={{
                              background: template.inputBg,
                              border: `1px solid ${template.cardBorder}`,
                              borderRadius: template.borderRadius || '0.25rem',
                            }}
                          />
                          {/* Button mock */}
                          <div
                            className="h-4 w-full rounded mt-auto"
                            style={{
                              background: template.buttonGradient,
                              borderRadius: template.borderRadius || '0.25rem',
                            }}
                          />
                        </div>
                      </div>

                      {/* Label area */}
                      <div className="px-3 py-2.5 bg-card border-t border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{template.name}</p>
                            <p className="text-[11px] text-muted-foreground leading-tight">{template.description}</p>
                          </div>
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected badge */}
                      {isSelected && (
                        <div
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: template.accentColor, color: template.textPrimary }}
                        >
                          ACTIVE
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Column Mapping Dialog */}
      <Dialog open={columnMappingOpen} onOpenChange={setColumnMappingOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Map Your Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Roll Number & Name selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Roll Number Column</Label>
                <Select value={selectedRollKey} onValueChange={setSelectedRollKey}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allHeaders.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Student Name Column</Label>
                <Select value={selectedNameKey} onValueChange={setSelectedNameKey}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allHeaders.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject checkboxes */}
            <div className="space-y-2">
              <Label>Select Subject Columns</Label>
              <p className="text-xs text-muted-foreground">Only subject columns are selectable. Metadata like Total, Position, Percentage, Rank, etc. is auto-separated.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {allHeaders
                  .filter(h => h !== selectedRollKey && h !== selectedNameKey && h.trim() && !isNonSubjectColumn(h))
                  .map(h => (
                    <label key={h} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors hover-scale">
                      <Checkbox
                        checked={selectedSubjects[h] ?? false}
                        onCheckedChange={(checked) =>
                          setSelectedSubjects(prev => ({ ...prev, [h]: !!checked }))
                        }
                      />
                      <span className="truncate">{h}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Preview table */}
            {parsedSheets.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                <Label>Preview ({parsedSheets[0].sheetName})</Label>
                <div className="border rounded-md overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{selectedRollKey}</TableHead>
                        <TableHead>{selectedNameKey}</TableHead>
                        {Object.entries(selectedSubjects)
                          .filter(([, v]) => v)
                          .filter(([k]) => !isNonSubjectColumn(k))
                          .map(([k]) => (
                            <TableHead key={k}>{k}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedSheets[0].data.slice(0, 3).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{String(row[selectedRollKey] ?? '')}</TableCell>
                          <TableCell>{String(row[selectedNameKey] ?? '')}</TableCell>
                          {Object.entries(selectedSubjects)
                            .filter(([, v]) => v)
                            .filter(([k]) => !isNonSubjectColumn(k))
                            .map(([k]) => (
                              <TableCell key={k}>{String(row[k] ?? '')}</TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnMappingOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Results'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
