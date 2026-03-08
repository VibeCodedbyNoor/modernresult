import { useState, useEffect, useRef } from 'react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Upload, Link as LinkIcon, LogOut, Eye, Trash2, School, Settings, FileSpreadsheet, Check, Palette, Coins, Zap, Gift, Clock, MessageCircle, CreditCard, Timer, Square, Play, StopCircle, CalendarClock, TrendingDown, BarChart3, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { resultTemplates, getTemplate } from '@/lib/resultTemplates';
import { generateSlugSuggestions } from '@/lib/slugSuggestions';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';
import CountdownDisplay from '@/components/CountdownDisplay';

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  result_template: string;
  search_fields: string[];
  template_changes_count: number;
  upload_count: number;
}

interface Exam {
  id: string;
  name: string;
  created_at: string;
  is_published: boolean;
  display_at: string | null;
  is_stopped: boolean;
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
  'sr', 'serial', 'class', 'section', 'mother', 'parent',
  'address', 'phone', 'mobile', 'email', 'dob', 'date', 'gender', 'age',
  'no.', 'no', 's.no', 's.r', 'reg', 'father'
];

const FATHER_NAME_PATTERNS = ['father', 'father name', 'father_name', 'fathername', 'walid', 'guardian'];

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
  const [sheetMappings, setSheetMappings] = useState<Record<string, {
    headers: string[];
    rollKey: string;
    nameKey: string;
    fatherKey: string;
    subjects: Record<string, { selected: boolean; totalMarks: number }>;
  }>>({});
  const [activeSheet, setActiveSheet] = useState('');

  // Class filter
  const [classFilter, setClassFilter] = useState<string>('all');

  // Credits state
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  // Timer dialog state
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [timerExamId, setTimerExamId] = useState<string | null>(null);
  const [timerDays, setTimerDays] = useState(0);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);

  // Template change confirmation dialog
  const [templateConfirmOpen, setTemplateConfirmOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  // Upload confirmation dialog
  const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
  const [uploadConfirmResolve, setUploadConfirmResolve] = useState<((val: boolean) => void) | null>(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSchool();
      supabase.from('profiles').select('school_name').eq('user_id', user.id).single().then(({ data }) => {
        if (data?.school_name && !schoolName) setSchoolName(data.school_name);
      });
    }
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

  async function handleConfirmTemplateChange() {
    if (!school || !pendingTemplateId) return;
    setTemplateConfirmOpen(false);

    const { data: success, error: rpcError } = await supabase
      .rpc('deduct_template_change_credits', { p_school_id: school.id });
    if (rpcError) { toast.error(rpcError.message); setPendingTemplateId(null); return; }
    if (!success) { toast.error('Not enough credits! You need at least 5 credits.'); setPendingTemplateId(null); return; }

    const { error } = await supabase
      .from('schools')
      .update({ result_template: pendingTemplateId })
      .eq('id', school.id);
    if (error) {
      toast.error(error.message);
    } else {
      setSchool({ ...school, result_template: pendingTemplateId, template_changes_count: school.template_changes_count + 1 });
      toast.success('Design changed (5 credits deducted)');
      const { data: credData } = await supabase.from('school_credits').select('balance').eq('school_id', school.id).single();
      if (credData) setCreditBalance(credData.balance);
    }
    setPendingTemplateId(null);
  }

  async function fetchCredits(schoolId: string) {
    const { data: creditData } = await supabase.from('school_credits').select('balance').eq('school_id', schoolId).single();
    if (creditData) setCreditBalance(creditData.balance);

    const { data: txData } = await supabase.from('credit_transactions').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(50);
    setTransactions(txData || []);
  }

  async function fetchExams(schoolId: string) {
    const { data } = await supabase.from('exams').select('*').eq('school_id', schoolId).order('created_at', { ascending: false });
    setExams((data || []) as Exam[]);
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

      // Build per-sheet mappings
      const mappings: typeof sheetMappings = {};
      for (const { sheetName, data: sheetData } of sheets) {
        const headers = Object.keys(sheetData[0] || {}).filter(h => {
          const trimmed = h.trim();
          if (!trimmed) return false;
          if (trimmed.startsWith('__EMPTY') || /^__EMPTY/.test(trimmed)) return false;
          return true;
        });
        const rollKey = headers.find(h => normalizeColumn(h).includes('roll')) || headers[0] || '';
        const nameKey = headers.find(h => normalizeColumn(h).includes('name') && !FATHER_NAME_PATTERNS.some(p => normalizeColumn(h).includes(p))) || headers[1] || '';
        const fatherKey = headers.find(h => FATHER_NAME_PATTERNS.some(p => normalizeColumn(h).includes(p))) || '';

        const subjects: Record<string, { selected: boolean; totalMarks: number }> = {};
        for (const h of headers) {
          if (h === rollKey || h === nameKey || h === fatherKey) continue;
          subjects[h] = { selected: !isNonSubjectColumn(h), totalMarks: 100 };
        }
        mappings[sheetName] = { headers, rollKey, nameKey, fatherKey, subjects };
      }

      setParsedSheets(sheets);
      setSheetMappings(mappings);
      setActiveSheet(sheets[0].sheetName);
      setUploadDialogOpen(false);
      setColumnMappingOpen(true);
    } catch (err: any) {
      toast.error('Failed to parse file: ' + err.message);
    }
  }

  async function handleConfirmUpload() {
    if (!selectedExam || !school) return;

    // Validate each sheet has roll + name selected
    for (const { sheetName } of parsedSheets) {
      const mapping = sheetMappings[sheetName];
      if (!mapping) continue;
      if (!mapping.rollKey || !mapping.nameKey || mapping.rollKey === mapping.nameKey) {
        toast.error(`Please choose different Roll Number and Student Name columns for "${sheetName}"`);
        return;
      }
      const hasSubjects = Object.values(mapping.subjects).some(s => s.selected);
      if (!hasSubjects) {
        toast.error(`Please select at least one subject for "${sheetName}"`);
        return;
      }
    }

    // Check upload credits (2 free, then 10 credits each)
    if (school.upload_count >= 2) {
      const confirmed = await new Promise<boolean>(resolve => {
        setUploadConfirmResolve(() => resolve);
        setUploadConfirmOpen(true);
      });
      if (!confirmed) return;
    }

    // Deduct upload credits
    const { data: uploadOk, error: uploadErr } = await supabase.rpc('deduct_upload_credits', { p_school_id: school.id });
    if (uploadErr) { toast.error(uploadErr.message); return; }
    if (!uploadOk) { toast.error('Not enough credits! You need at least 10 credits to upload results.'); return; }

    setUploading(true);
    try {
      const allRows: any[] = [];
      for (const { sheetName, data } of parsedSheets) {
        const mapping = sheetMappings[sheetName];
        if (!mapping) continue;

        const subjectEntries = Object.entries(mapping.subjects).filter(([, v]) => v.selected);

        for (const row of data) {
          const subjects: Record<string, { obtained: number; total: number }> = {};
          let total = 0;

          for (const [subj, config] of subjectEntries) {
            const marks = parseMarksValue(row[subj]);
            subjects[subj] = { obtained: marks, total: config.totalMarks };
            total += marks;
          }

          const avg = subjectEntries.length > 0 ? total / subjectEntries.length : 0;
          const grade = avg >= 90 ? 'A+' : avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'F';

          allRows.push({
            exam_id: selectedExam,
            roll_number: String(row[mapping.rollKey] || '').trim(),
            student_name: String(row[mapping.nameKey] || '').trim(),
            father_name: mapping.fatherKey ? String(row[mapping.fatherKey] || '').trim() : '',
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

      // Compute position per class (sorted by total_marks descending)
      const byClass: Record<string, typeof validRows> = {};
      for (const row of validRows) {
        if (!byClass[row.class_name]) byClass[row.class_name] = [];
        byClass[row.class_name].push(row);
      }
      for (const className of Object.keys(byClass)) {
        byClass[className].sort((a, b) => b.total_marks - a.total_marks);
        byClass[className].forEach((row, idx) => {
          row.subjects = { ...row.subjects, Position: idx + 1 };
        });
      }

      await supabase.from('results').delete().eq('exam_id', selectedExam);

      const { error } = await supabase.from('results').insert(validRows);
      if (error) {
        toast.error(error.message);
      } else {
        const uploadMsg = school.upload_count < 2
          ? `${validRows.length} results uploaded (free upload used)`
          : `${validRows.length} results uploaded (10 credits deducted)`;
        toast.success(uploadMsg);
        setSchool({ ...school, upload_count: school.upload_count + 1 });
        setColumnMappingOpen(false);
        setParsedSheets([]);
        fetchResults(selectedExam);
        fetchCredits(school.id);
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

  // Timer controls
  async function handleSetTimer() {
    if (!timerExamId) return;
    const totalMs = (timerDays * 86400 + timerHours * 3600 + timerMinutes * 60) * 1000;
    if (totalMs <= 0) {
      toast.error('Please set a valid timer duration');
      return;
    }
    const displayAt = new Date(Date.now() + totalMs).toISOString();
    const { error } = await supabase.from('exams').update({ display_at: displayAt, is_stopped: false }).eq('id', timerExamId);
    if (error) {
      toast.error(error.message);
    } else {
      setExams(prev => prev.map(ex => ex.id === timerExamId ? { ...ex, display_at: displayAt, is_stopped: false } : ex));
      toast.success('Timer set! Results will show after countdown ends.');
      setTimerDialogOpen(false);
      setTimerDays(0);
      setTimerHours(0);
      setTimerMinutes(0);
    }
  }

  async function handleStopShowing(examId: string) {
    const { error } = await supabase.from('exams').update({ is_stopped: true }).eq('id', examId);
    if (error) {
      toast.error(error.message);
    } else {
      setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, is_stopped: true } : ex));
      toast.success('Results hidden from portal');
    }
  }

  async function handleStartShowing(examId: string) {
    const { error } = await supabase.from('exams').update({ is_stopped: false, display_at: null }).eq('id', examId);
    if (error) {
      toast.error(error.message);
    } else {
      setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, is_stopped: false, display_at: null } : ex));
      toast.success('Results are now visible');
    }
  }

  function getExamTimerStatus(exam: Exam) {
    if (exam.is_stopped) return 'stopped';
    if (exam.display_at && new Date(exam.display_at) > new Date()) return 'countdown';
    return 'live';
  }

  // Analytics helpers
  const todayCredits = transactions.filter(tx => tx.type === 'result_check' && new Date(tx.created_at).toDateString() === new Date().toDateString()).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCredits = transactions.filter(tx => tx.type === 'result_check' && new Date(tx.created_at) >= weekAgo).reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
  const monthCredits = transactions.filter(tx => tx.type === 'result_check' && new Date(tx.created_at) >= monthAgo).reduce((s, tx) => s + Math.abs(tx.amount), 0);

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
                    <span className="whitespace-nowrap">resultportal.online/results/</span>
                    <Input value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)} placeholder="greenfield-academy" required />
                  </div>
                  {schoolName && generateSlugSuggestions(schoolName).length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Suggestions — click to use</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {generateSlugSuggestions(schoolName).map(slug => (
                          <Badge
                            key={slug}
                            variant={schoolSlug === slug ? 'default' : 'outline'}
                            className="cursor-pointer text-xs hover:bg-accent transition-colors"
                            onClick={() => setSchoolSlug(slug)}
                          >
                            {slug}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
            <a href={`https://resultportal.online/results/${school.slug}`} target="_blank" rel="noreferrer">
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
                        <p className="text-xs text-muted-foreground">Give your exam a clear name like "Annual Exam 2026" or "Mid-Term 2026"</p>
                      </div>
                      <Button onClick={handleCreateExam} className="w-full">Create Exam</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {selectedExam && (
              <>
                {/* Timer & Visibility Controls */}
                {(() => {
                  const exam = exams.find(e => e.id === selectedExam);
                  if (!exam) return null;
                  const status = getExamTimerStatus(exam);
                  return (
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              status === 'live' ? 'bg-green-500/10' : status === 'countdown' ? 'bg-amber-500/10' : 'bg-destructive/10'
                            }`}>
                              {status === 'live' && <Play className="h-5 w-5 text-green-500" />}
                              {status === 'countdown' && <Timer className="h-5 w-5 text-amber-500" />}
                              {status === 'stopped' && <StopCircle className="h-5 w-5 text-destructive" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">Result Visibility</p>
                                <Badge variant={status === 'live' ? 'default' : status === 'countdown' ? 'secondary' : 'destructive'} className="text-[10px]">
                                  {status === 'live' ? 'LIVE' : status === 'countdown' ? 'COUNTDOWN' : 'STOPPED'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {status === 'live' && 'Results are visible on the portal'}
                                {status === 'countdown' && <CountdownDisplay targetDate={exam.display_at!} />}
                                {status === 'stopped' && 'Results are hidden from the portal'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              title="Schedule when results become visible to students"
                              onClick={() => {
                                setTimerExamId(selectedExam);
                                setTimerDays(0);
                                setTimerHours(0);
                                setTimerMinutes(0);
                                setTimerDialogOpen(true);
                              }}
                            >
                              <CalendarClock className="h-3.5 w-3.5" /> Set Timer
                            </Button>
                            {status !== 'stopped' ? (
                              <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => handleStopShowing(selectedExam)}>
                                <Square className="h-3.5 w-3.5" /> Stop Showing
                              </Button>
                            ) : (
                              <Button variant="default" size="sm" className="gap-1.5" onClick={() => handleStartShowing(selectedExam)}>
                                <Play className="h-3.5 w-3.5" /> Start Showing
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Actions bar */}
                <div className="flex gap-2 flex-wrap items-center">
                  <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> Upload Excel / CSV
                        {school && (
                          <Badge variant="secondary" className="ml-1 text-[10px]" title="First 2 uploads are free, then 10 credits each">
                            {school.upload_count < 2
                              ? `${2 - school.upload_count} free`
                              : '10 credits'}
                          </Badge>
                        )}
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
                  {exams.find(e => e.id === selectedExam)?.is_published ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(selectedExam, true)}
                      className="gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> Unpublish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleTogglePublish(selectedExam, false)}
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-md animate-pulse"
                    >
                      <Eye className="h-3.5 w-3.5" /> ✦ Publish Exam
                    </Button>
                  )}

                  {classNames.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap ml-auto">
                      <Button
                        variant={classFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setClassFilter('all')}
                        className="text-xs h-7 px-2.5"
                      >
                        All ({results.length})
                      </Button>
                      {classNames.map(cn => (
                        <Button
                          key={cn}
                          variant={classFilter === cn ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setClassFilter(cn)}
                          className="text-xs h-7 px-2.5"
                        >
                          {cn} ({results.filter(r => r.class_name === cn).length})
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results table */}
                {filteredResults.length > 0 ? (() => {
                  // Extract unique subject keys (exclude Position and non-subject metadata)
                  const subjectKeys = [...new Set(
                    filteredResults.flatMap(r => {
                      if (typeof r.subjects !== 'object' || !r.subjects) return [];
                      return Object.keys(r.subjects).filter(k => {
                        const norm = k.toLowerCase();
                        return norm !== 'position' && !NON_SUBJECT_PATTERNS.some(p => norm.includes(p));
                      });
                    })
                  )];

                  return (
                  <Card>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Class</TableHead>
                            {subjectKeys.map(subj => (
                              <TableHead key={subj} className="text-center whitespace-nowrap">{subj}</TableHead>
                            ))}
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-center">Pos</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.map(r => {
                            const subjects = (typeof r.subjects === 'object' && r.subjects) ? r.subjects : {};
                            const position = subjects.Position;
                            return (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono">{r.roll_number}</TableCell>
                              <TableCell>{r.student_name}</TableCell>
                              <TableCell>{r.class_name}</TableCell>
                              {subjectKeys.map(subj => {
                                const val = subjects[subj];
                                const obtained = typeof val === 'object' && val !== null ? val.obtained : (typeof val === 'number' ? val : '—');
                                return <TableCell key={subj} className="text-center font-mono">{obtained}</TableCell>;
                              })}
                              <TableCell className="text-center font-semibold">{r.total_marks}</TableCell>
                              <TableCell className="text-center font-mono">{position ?? '—'}</TableCell>
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
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  );
                })() : (
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

            {/* Quick Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {[
                { label: 'Today', value: todayCredits, icon: BarChart3 },
                { label: 'This Week', value: weekCredits, icon: TrendingDown },
                { label: 'This Month', value: monthCredits, icon: CreditCard },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-lg font-display font-bold text-foreground">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Buy Credits */}
            <Card className="max-w-2xl border-primary/20">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Buy Credits
                </CardTitle>
                <CardDescription className="text-base">
                  Go digital and <strong>save over 80%</strong> compared to traditional printed DMCs!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { credits: 50, price: 450, perCredit: '9', bonus: 0, label: '50 Credits — PKR 450' },
                    { credits: 100, price: 900, perCredit: '9', bonus: 0, label: '100 Credits — PKR 900' },
                    { credits: 500, price: 4500, perCredit: '8.18', bonus: 50, label: '500+50 Credits — PKR 4,500' },
                  ].map(plan => (
                    <button
                      key={plan.credits}
                      type="button"
                      onClick={() => setSelectedPlan(plan.credits)}
                      className={`rounded-xl p-4 text-center space-y-1 relative overflow-hidden transition-all border-2 ${
                        selectedPlan === plan.credits
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      {plan.bonus > 0 && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                          <Gift className="h-2.5 w-2.5" /> BEST VALUE
                        </div>
                      )}
                      <p className="text-2xl font-display font-bold text-foreground">{plan.credits}</p>
                      {plan.bonus > 0 && <p className="text-xs text-primary font-semibold">+ {plan.bonus} FREE bonus!</p>}
                      {plan.bonus === 0 && <p className="text-xs text-muted-foreground">credits</p>}
                      <p className="text-lg font-semibold text-primary">PKR {plan.price.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Rs. {plan.perCredit}/credit</p>
                      {selectedPlan === plan.credits && (
                        <div className="flex items-center justify-center gap-1 text-xs text-primary font-medium pt-1">
                          <Check className="h-3 w-3" /> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {!selectedPlan && (
                  <p className="text-sm text-muted-foreground text-center animate-pulse">👆 Select a plan above to continue</p>
                )}

                {selectedPlan && (
                  <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm font-semibold text-foreground">Payment Details</p>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Easypaisa:</strong> 03479104843</p>
                      <p><strong className="text-foreground">JazzCash:</strong> 03479104843</p>
                      <p><strong className="text-foreground">Account Name:</strong> Muhammad Irfan</p>
                      <p className="pt-1"><strong className="text-foreground">Amount:</strong>{' '}
                        <span className="text-primary font-semibold">
                          PKR {selectedPlan === 50 ? '450' : selectedPlan === 100 ? '900' : '4,500'}
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-border space-y-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Send payment & screenshot via WhatsApp — credits added within 1 hour
                      </p>
                      <a
                        href={`https://wa.me/923479104843?text=${encodeURIComponent(
                          `Assalam o Alaikum! 🎓\n\nI have purchased credits on ResultPortal.\n\n📧 My Email: ${user?.email || ''}\n🏫 School: ${school?.name || ''}\n💰 Package: ${selectedPlan === 500 ? '500 + 50 bonus' : selectedPlan} credits\n💵 Amount: PKR ${selectedPlan === 50 ? '450' : selectedPlan === 100 ? '900' : '4,500'}\n\nPayment screenshot is attached. Please add my credits. JazakAllah! 🙏`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button className="w-full gap-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-primary-foreground">
                          <MessageCircle className="h-4 w-4" />
                          Send Payment Screenshot via WhatsApp
                        </Button>
                      </a>
                      <p className="text-[11px] text-muted-foreground text-center">
                        Click above after payment — your email, school & package are auto-filled. Just attach the screenshot!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase / Transaction History */}
            {transactions.length > 0 && (
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(tx.created_at), 'dd MMM yyyy, hh:mm a')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={tx.amount > 0 ? 'default' : 'secondary'} className="text-[10px]">
                              {tx.type === 'signup_bonus' ? 'Bonus' : tx.type === 'admin_topup' ? 'Top-up' : tx.type === 'result_check' ? 'Result View' : tx.type === 'bulk_marksheet' ? 'Bulk Download' : tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {tx.description || '—'}
                          </TableCell>
                          <TableCell className={`text-right font-mono text-sm font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-destructive'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
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
                    <a href={`https://resultportal.online/results/${school.slug}`} target="_blank" rel="noreferrer" className="text-sm text-primary underline bg-muted px-2 py-1 rounded">
                      resultportal.online/results/{school.slug}
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://resultportal.online/results/${school.slug}`);
                        toast.success('URL copied to clipboard!');
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Copy
                    </Button>
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

            {/* Search Fields Config */}
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> Portal Search Fields
                </CardTitle>
                <CardDescription>Choose which fields students use to search their results on your portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'roll_number', label: 'Roll Number', hint: 'Students search by their roll/registration number' },
                  { id: 'student_name', label: 'Student Name', hint: 'Students search by typing their name' },
                  { id: 'father_name', label: 'Father Name', hint: 'Students search using their father\'s name' },
                ].map(field => (
                  <div key={field.id} className="flex items-start gap-3">
                    <Checkbox
                      className="mt-0.5"
                      checked={(school.search_fields || ['student_name']).includes(field.id)}
                      onCheckedChange={async (checked) => {
                        const current = school.search_fields || ['student_name'];
                        const updated = checked
                          ? [...current, field.id]
                          : current.filter(f => f !== field.id);
                        if (updated.length === 0) {
                          toast.error('You must keep at least one search field');
                          return;
                        }
                        const { error } = await supabase.from('schools').update({ search_fields: updated } as any).eq('id', school.id);
                        if (error) { toast.error(error.message); }
                        else { setSchool({ ...school, search_fields: updated }); toast.success('Search fields updated'); }
                      }}
                    />
                    <div>
                      <Label className="text-sm">{field.label}</Label>
                      <p className="text-xs text-muted-foreground">{field.hint}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Changes are applied instantly to your live portal at <strong>resultportal.online/results/{school.slug}</strong>. Design previews below show default fields.</p>
              </CardContent>
            </Card>

            {/* Result Design Template Picker */}
            <div className="space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" /> Choose Your Result Portal Design
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pick a style below — this is exactly how students will see your result portal. Just click to apply!
                  </p>
                </div>
                <Badge variant={school.template_changes_count < 3 ? 'default' : 'secondary'} className="text-xs shrink-0" title="First 3 design changes are free, then 5 credits each">
                  {school.template_changes_count < 3
                    ? `${3 - school.template_changes_count} free change${3 - school.template_changes_count !== 1 ? 's' : ''} remaining`
                    : '5 credits per change'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {resultTemplates.map((template) => {
                  const isSelected = (school.result_template || 'luxury-gold') === template.id;
                  return (
                    <button
                      key={template.id}
                    onClick={async () => {
                        if (isSelected) return;
                        
                        // Check if this will cost credits and confirm
                        if (school.template_changes_count >= 3) {
                          setPendingTemplateId(template.id);
                          setTemplateConfirmOpen(true);
                          return;
                        }

                        // Free change — proceed directly
                        const { data: success, error: rpcError } = await supabase
                          .rpc('deduct_template_change_credits', { p_school_id: school.id });
                        
                        if (rpcError) {
                          toast.error(rpcError.message);
                          return;
                        }
                        if (!success) {
                          toast.error('Not enough credits! You need at least 5 credits to change the design.');
                          return;
                        }

                        // Now update the template
                        const { error } = await supabase
                          .from('schools')
                          .update({ result_template: template.id })
                          .eq('id', school.id);
                        if (error) {
                          toast.error(error.message);
                        } else {
                          setSchool({
                            ...school,
                            result_template: template.id,
                            template_changes_count: school.template_changes_count + 1,
                          });
                          if (school.template_changes_count < 3) {
                            toast.success(`Design changed to "${template.name}" (free change used)`);
                          } else {
                            toast.success(`Design changed to "${template.name}" (5 credits deducted)`);
                          }
                          // Refresh credits display
                          const { data: credData } = await supabase
                            .from('school_credits')
                            .select('balance')
                            .eq('school_id', school.id)
                            .single();
                          if (credData) setCreditBalance(credData.balance);
                        }
                      }}
                      className={`group relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 shadow-md'
                          : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
                      {/* Live iframe preview */}
                      <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
                        <iframe
                          src={`/demo/${template.id}`}
                          title={template.name}
                          className="absolute top-0 left-0 pointer-events-none border-0"
                          style={{
                            width: '400%',
                            height: '400%',
                            transform: 'scale(0.25)',
                            transformOrigin: 'top left',
                          }}
                          loading="lazy"
                          tabIndex={-1}
                        />
                      </div>
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
                      {isSelected && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: template.accentColor, color: template.textPrimary }}>
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

      {/* Timer Dialog */}
      <Dialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" /> Set Result Timer
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Set a countdown. Results will be hidden until the timer ends, then automatically displayed.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Days</Label>
              <Input type="number" min={0} max={365} value={timerDays} onChange={e => setTimerDays(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hours</Label>
              <Input type="number" min={0} max={23} value={timerHours} onChange={e => setTimerHours(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Minutes</Label>
              <Input type="number" min={0} max={59} value={timerMinutes} onChange={e => setTimerMinutes(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSetTimer} className="gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> Start Countdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      <Dialog open={columnMappingOpen} onOpenChange={setColumnMappingOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Map Your Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Sheet tabs */}
            {parsedSheets.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {parsedSheets.map(({ sheetName }) => (
                  <Button
                    key={sheetName}
                    variant={activeSheet === sheetName ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSheet(sheetName)}
                    className="text-xs h-7 px-2.5"
                  >
                    {sheetName}
                  </Button>
                ))}
              </div>
            )}

            {activeSheet && sheetMappings[activeSheet] && (() => {
              const mapping = sheetMappings[activeSheet];
              const sheetData = parsedSheets.find(s => s.sheetName === activeSheet)?.data || [];
              const subjectHeaders = mapping.headers.filter(h => h !== mapping.rollKey && h !== mapping.nameKey && h !== mapping.fatherKey && !isNonSubjectColumn(h));

              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Roll Number Column</Label>
                      <Select value={mapping.rollKey} onValueChange={val => setSheetMappings(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], rollKey: val } }))}>
                        <SelectTrigger className="h-8 text-xs min-w-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {mapping.headers.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Student Name Column</Label>
                      <Select value={mapping.nameKey} onValueChange={val => setSheetMappings(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], nameKey: val } }))}>
                        <SelectTrigger className="h-8 text-xs min-w-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {mapping.headers.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Father Name Column <span className="text-muted-foreground">(optional)</span></Label>
                    <Select value={mapping.fatherKey || '__none__'} onValueChange={val => setSheetMappings(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], fatherKey: val === '__none__' ? '' : val } }))}>
                      <SelectTrigger className="h-8 text-xs min-w-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        {mapping.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Subjects & Total Marks</Label>
                    <p className="text-[11px] text-muted-foreground">Check subjects to include. Set total marks for each.</p>
                    <div className="space-y-1 mt-1.5 max-h-48 overflow-y-auto">
                      {subjectHeaders.map(h => {
                        const subj = mapping.subjects[h];
                        if (!subj) return null;
                        return (
                          <div key={h} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                            <Checkbox
                              checked={subj.selected}
                              onCheckedChange={(checked) =>
                                setSheetMappings(prev => ({
                                  ...prev,
                                  [activeSheet]: {
                                    ...prev[activeSheet],
                                    subjects: { ...prev[activeSheet].subjects, [h]: { ...subj, selected: !!checked } }
                                  }
                                }))
                              }
                            />
                            <span className="text-xs truncate flex-1">{h}</span>
                            <Input
                              type="number"
                              min={1}
                              value={subj.totalMarks}
                              onChange={e =>
                                setSheetMappings(prev => ({
                                  ...prev,
                                  [activeSheet]: {
                                    ...prev[activeSheet],
                                    subjects: { ...prev[activeSheet].subjects, [h]: { ...subj, totalMarks: Number(e.target.value) || 100 } }
                                  }
                                }))
                              }
                              className="w-16 h-7 text-xs text-center"
                              disabled={!subj.selected}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview - vertical card layout */}
                  {sheetData.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sample Preview (1st Student)</Label>
                      <div className="border rounded-md p-3 bg-muted/30 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{mapping.rollKey}:</span>
                          <span className="font-mono font-medium truncate ml-2">{String(sheetData[0]?.[mapping.rollKey] ?? '—')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{mapping.nameKey}:</span>
                          <span className="font-medium truncate ml-2">{String(sheetData[0]?.[mapping.nameKey] ?? '—')}</span>
                        </div>
                        {mapping.fatherKey && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{mapping.fatherKey}:</span>
                            <span className="font-medium truncate ml-2">{String(sheetData[0]?.[mapping.fatherKey] ?? '—')}</span>
                          </div>
                        )}
                        {Object.entries(mapping.subjects)
                          .filter(([, v]) => v.selected)
                          .map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-muted-foreground truncate">{k}:</span>
                              <span className="font-medium ml-2">{String(sheetData[0]?.[k] ?? '—')} / {v.totalMarks}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setColumnMappingOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleConfirmUpload} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? 'Uploading...' : 'Upload Results'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={templateConfirmOpen} onOpenChange={setTemplateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Portal Design</AlertDialogTitle>
            <AlertDialogDescription>
              This design change will cost <span className="font-semibold text-foreground">5 credits</span>. Your current balance is <span className="font-semibold text-foreground">{creditBalance ?? 0} credits</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTemplateId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTemplateChange}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={uploadConfirmOpen} onOpenChange={(open) => {
        if (!open && uploadConfirmResolve) { uploadConfirmResolve(false); setUploadConfirmResolve(null); }
        setUploadConfirmOpen(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Results</AlertDialogTitle>
            <AlertDialogDescription>
              This upload will cost <span className="font-semibold text-foreground">10 credits</span>. Your current balance is <span className="font-semibold text-foreground">{creditBalance ?? 0} credits</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { if (uploadConfirmResolve) { uploadConfirmResolve(false); setUploadConfirmResolve(null); } }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (uploadConfirmResolve) { uploadConfirmResolve(true); setUploadConfirmResolve(null); } setUploadConfirmOpen(false); }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <WhatsAppHelpButton />
    </div>
  );
}
