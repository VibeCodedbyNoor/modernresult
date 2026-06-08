import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Plus, Link as LinkIcon, LogOut, Eye, Trash2, School, Settings, FileSpreadsheet, Check, Palette, Coins, MessageCircle, CreditCard, Timer, Square, Play, StopCircle, CalendarClock, Search, Users, Wallet, Copy, Banknote, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { resultTemplates, getTemplate } from '@/lib/resultTemplates';
import { generateSlugSuggestions } from '@/lib/slugSuggestions';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import WhatsAppHelpButton from '@/components/WhatsAppHelpButton';
import CountdownDisplay from '@/components/CountdownDisplay';
import { DashboardSkeleton } from '@/components/LoadingSkeletons';
import QRCodeCard from '@/components/portal/QRCodeCard';
import ThemeToggle from '@/components/ThemeToggle';
import GettingStartedCard from '@/components/dashboard/GettingStartedCard';
import HelpTab from '@/components/dashboard/HelpTab';
import HelpDialog from '@/components/dashboard/HelpDialog';
import UploadWizard from '@/components/upload/UploadWizard';
import ExamSettingsForm from '@/components/dashboard/ExamSettingsForm';
import DMCSettingsForm from '@/components/dashboard/DMCSettingsForm';
import type { ExamSettings } from '@/lib/examCalculations';
import type { DMCSettings } from '@/lib/generateDMC';
import { Sliders, FileText } from 'lucide-react';


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
  plan?: string;
  dmc_settings?: any;
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

interface ReferralData {
  id: string;
  referred_user_id: string;
  created_at: string;
  profiles?: {
    school_name: string;
  };
}

interface ReferralEarning {
  id: string;
  credits_purchased: number;
  commission_credits: number;
  commission_rupees?: number;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
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
  const { t } = useLanguage();
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
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

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

  // Timer dialog state
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [timerExamId, setTimerExamId] = useState<string | null>(null);
  const [timerDays, setTimerDays] = useState(0);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);

  // Referral state
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarning[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('easypaisa');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawName, setWithdrawName] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Help dialog
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

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
    }
    fetchReferralData();
    setLoading(false);
  }

  async function fetchReferralData() {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();
    if (profile?.referral_code) setReferralCode(profile.referral_code);

    const { data: refs, error: refsError } = await supabase.rpc('get_my_referrals');

    if (refsError) {
      console.error('get_my_referrals error:', refsError);
      const { data: fallbackRefs } = await supabase
        .from('referrals')
        .select('id, referred_user_id, created_at')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals((fallbackRefs || []).map((r: any) => ({
        id: r.id,
        referred_user_id: r.referred_user_id,
        created_at: r.created_at,
      })));
    } else {
      const transformedRefs = (refs || []).map((r: any) => ({
        id: r.id,
        referred_user_id: r.referred_user_id,
        created_at: r.created_at,
        profiles: { school_name: r.school_name || '' },
      }));
      setReferrals(transformedRefs);
    }

    const { data: earnings } = await supabase
      .from('referral_earnings')
      .select('id, credits_purchased, commission_credits, commission_rupees, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
    setReferralEarnings((earnings || []) as ReferralEarning[]);

    const { data: wds } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWithdrawals(wds || []);
  }

  async function handleWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 400) {
      toast.error('Minimum withdrawal is ₨400');
      return;
    }
    
    const totalEarned = referralEarnings.reduce((sum, earn) => sum + (earn.commission_rupees || earn.commission_credits * 9), 0);
    const totalWithdrawnAmount = withdrawals.filter(w => w.status !== 'rejected').reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarned - totalWithdrawnAmount;
    if (amount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!withdrawAccount.trim() || !withdrawName.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setWithdrawing(true);
    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount,
      payment_method: withdrawMethod,
      account_number: withdrawAccount,
      account_name: withdrawName,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Withdrawal request submitted!');
      setWithdrawAmount('');
      setWithdrawAccount('');
      setWithdrawName('');
      fetchReferralData();
    }
    setWithdrawing(false);
  }

  async function updateResultTemplate(templateId: string, templateName: string) {
    if (!school) return;

    const { error } = await supabase
      .from('schools')
      .update({ result_template: templateId, template_changes_count: school.template_changes_count + 1 })
      .eq('id', school.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSchool({
      ...school,
      result_template: templateId,
      template_changes_count: school.template_changes_count + 1,
    });
    toast.success(`Design changed to "${templateName}"`);
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

  async function handleSaveExamSettings(settings: ExamSettings) {
    if (!selectedExam) return;
    setSavingSettings(true);
    const { error } = await supabase.from('exams').update({ exam_settings: settings as any }).eq('id', selectedExam);
    setSavingSettings(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Calculation settings saved');
      setSettingsDialogOpen(false);
      if (school) fetchExams(school.id);
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

    // Free plan: uploads are unlimited and free — no credit deduction.

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
        const uploadMsg = `${validRows.length} results uploaded`;
        toast.success(uploadMsg);
        setSchool({ ...school, upload_count: school.upload_count + 1 });
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


  const classNames = [...new Set(results.map(r => r.class_name).filter(Boolean))];
  const filteredResults = classFilter === 'all' ? results : results.filter(r => r.class_name === classFilter);

  // Check progress for getting started card
  const hasExams = exams.length > 0;
  const hasResults = results.length > 0;
  const hasPublished = exams.some(e => e.is_published);

  if (authLoading || loading) {
    return <DashboardSkeleton />;
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
              <CardTitle className="font-display text-2xl">{t('dash.setup_title')}</CardTitle>
              <CardDescription>{t('dash.setup_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetupSchool} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('dash.school_name')}</Label>
                  <Input value={schoolName} onChange={e => { setSchoolName(e.target.value); setSchoolSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="Greenfield Academy" required />
                </div>
                <div className="space-y-2">
                  <Label>{t('dash.url_slug')}</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="whitespace-nowrap">resultportal.online/results/</span>
                    <Input value={schoolSlug} onChange={e => setSchoolSlug(e.target.value)} placeholder="greenfield-academy" required />
                  </div>
                  {schoolName && generateSlugSuggestions(schoolName).length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t('dash.slug_suggestions')}</Label>
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
                  <Label>{t('dash.accent_color')}</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 w-14 rounded cursor-pointer border border-input" />
                    <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1" />
                  </div>
                </div>
                <Button type="submit" className="w-full">{t('dash.create_portal')}</Button>
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
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="font-display font-bold text-primary text-sm sm:text-base shrink-0">OnlineResultPortal</span>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="font-medium text-foreground text-xs sm:text-sm truncate">{school.name}</span>
            {(school as any).plan === 'pro' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-black shrink-0">
                ⭐ Pro
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                Free
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHelpDialogOpen(true)} title={t('dash.tab_help')}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs sm:text-sm px-1.5 sm:px-3 h-8"
              onClick={() => navigate('/dashboard/billing')}
              title="Billing & Plan"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Billing</span>
            </Button>
            <a href={`https://resultportal.online/results/${school.slug}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm px-2 sm:px-3 h-8">
                <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t('dash.view_portal')}</span><span className="sm:hidden">Portal</span>
              </Button>
            </a>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="gap-1 text-xs sm:text-sm px-1.5 sm:px-3 h-8">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t('dash.sign_out')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Done-for-you help banner */}
        <a
          href={`https://wa.me/923478312432?text=${encodeURIComponent("Assalam o Alaikum! I want you to set up my result portal.\n\nMy school name is: ___\nGoogle Sheet link: ___")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 mb-6 hover:bg-accent/30 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <MessageCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t('dash.help_banner_title')}</p>
            <p className="text-xs text-muted-foreground">{t('dash.help_banner_desc')}</p>
          </div>
          <span className="text-xs font-medium text-green-500 shrink-0 group-hover:underline">{t('dash.help_banner_cta')}</span>
        </a>

        {/* Getting Started Card */}
        <GettingStartedCard hasExams={hasExams} hasResults={hasResults} hasPublished={hasPublished} />

        <Tabs defaultValue="exams">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="exams" className="text-xs sm:text-sm">{t('dash.tab_exams')}</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">{t('dash.tab_settings')}</TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs sm:text-sm">{t('dash.tab_referrals')}</TabsTrigger>
            <TabsTrigger value="help" className="text-xs sm:text-sm">{t('dash.tab_help')}</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-6 mt-6">
            {/* Exam selector + create button */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Select value={selectedExam || ''} onValueChange={val => fetchResults(val)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder={t('dash.select_exam')} />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name} {ex.is_published ? '✓' : t('dash.draft')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> {t('dash.new_exam')}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">{t('dash.create_exam')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('dash.exam_name')}</Label>
                        <Input value={newExamName} onChange={e => setNewExamName(e.target.value)} placeholder="e.g. Mid-Term 2026" />
                        <p className="text-xs text-muted-foreground">{t('dash.exam_name_hint')}</p>
                      </div>
                      <Button onClick={handleCreateExam} className="w-full">{t('dash.create_exam_btn')}</Button>
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
                                <p className="text-sm font-semibold text-foreground">{t('dash.result_visibility')}</p>
                                <Badge variant={status === 'live' ? 'default' : status === 'countdown' ? 'secondary' : 'destructive'} className="text-[10px]">
                                  {status === 'live' ? t('dash.status_live') : status === 'countdown' ? t('dash.status_countdown') : t('dash.status_stopped')}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {status === 'live' && t('dash.live_desc')}
                                {status === 'countdown' && <CountdownDisplay targetDate={exam.display_at!} />}
                                {status === 'stopped' && t('dash.stopped_desc')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => {
                                setTimerExamId(selectedExam);
                                setTimerDays(0);
                                setTimerHours(0);
                                setTimerMinutes(0);
                                setTimerDialogOpen(true);
                              }}
                            >
                              <CalendarClock className="h-3.5 w-3.5" /> {t('dash.set_timer')}
                            </Button>
                            {status !== 'stopped' ? (
                              <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => handleStopShowing(selectedExam)}>
                                <Square className="h-3.5 w-3.5" /> {t('dash.stop_showing')}
                              </Button>
                            ) : (
                              <Button variant="default" size="sm" className="gap-1.5" onClick={() => handleStartShowing(selectedExam)}>
                                <Play className="h-3.5 w-3.5" /> {t('dash.start_showing')}
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
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setUploadDialogOpen(true)}>
                    <FileSpreadsheet className="h-3.5 w-3.5" /> {t('dash.upload_excel')}
                  </Button>
                  {selectedExam && school && (
                    <UploadWizard
                      open={uploadDialogOpen}
                      onOpenChange={setUploadDialogOpen}
                      examId={selectedExam}
                      schoolId={school.id}
                      onComplete={() => fetchResults(selectedExam)}
                    />
                  )}
                  {exams.find(e => e.id === selectedExam)?.is_published ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(selectedExam, true)}
                      className="gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> {t('dash.unpublish')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleTogglePublish(selectedExam, false)}
                      className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-md animate-pulse"
                    >
                      <Eye className="h-3.5 w-3.5" /> {t('dash.publish_exam')}
                    </Button>
                  )}

                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSettingsDialogOpen(true)}>
                    <Sliders className="h-3.5 w-3.5" /> Calculation Settings
                  </Button>

                  <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Calculation Settings</DialogTitle></DialogHeader>
                      <ExamSettingsForm
                        value={(exams.find(e => e.id === selectedExam) as any)?.exam_settings}
                        onSave={handleSaveExamSettings}
                        saving={savingSettings}
                      />
                    </DialogContent>
                  </Dialog>

                  {classNames.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap ml-auto">
                      <Button
                        variant={classFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setClassFilter('all')}
                        className="text-xs h-7 px-2.5"
                      >
                        {t('dash.all')} ({results.length})
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
                            <TableHead>{t('dash.roll')}</TableHead>
                            <TableHead>{t('dash.name')}</TableHead>
                            <TableHead>{t('dash.father')}</TableHead>
                            <TableHead>{t('dash.class')}</TableHead>
                            {subjectKeys.map(s => <TableHead key={s} className="text-center">{s}</TableHead>)}
                            <TableHead className="text-center">{t('dash.total')}</TableHead>
                            <TableHead className="text-center">{t('dash.grade')}</TableHead>
                            <TableHead className="text-right">{t('dash.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResults.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-mono">{r.roll_number}</TableCell>
                              <TableCell>{r.student_name}</TableCell>
                              <TableCell className="text-muted-foreground">{(r as any).father_name || '—'}</TableCell>
                              <TableCell className="text-muted-foreground">{r.class_name || '—'}</TableCell>
                              {subjectKeys.map(s => (
                                <TableCell key={s} className="text-center font-mono text-muted-foreground">
                                  {r.subjects?.[s]?.obtained ?? '—'}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-semibold">{r.total_marks}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{r.grade}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteResult(r.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  );
                })() : (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t('dash.no_results')}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!selectedExam && exams.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Plus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t('dash.create_first_exam')}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>


          <TabsContent value="referrals" className="mt-6 space-y-6">
            {(() => {
              const totalEarningsRupees = referralEarnings.reduce((sum, e) => sum + (e.commission_rupees || e.commission_credits * 9), 0);
              const totalWithdrawn = withdrawals.filter(w => w.status !== 'rejected').reduce((sum, w) => sum + w.amount, 0);
              const availableBalance = totalEarningsRupees - totalWithdrawn;
              const referralLink = referralCode ? `https://resultportal.online/signup?ref=${referralCode}` : '';

              const maskSchoolName = (name: string) => {
                if (!name || name.length < 4) return '***';
                return name.substring(0, 3) + '***';
              };

              return (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dash.total_referrals')}</p>
                          <p className="text-2xl font-display font-bold text-foreground">{referrals.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dash.total_earned')}</p>
                          <p className="text-2xl font-display font-bold text-foreground">₨{totalEarningsRupees.toFixed(0)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('dash.available_balance')}</p>
                          <p className="text-2xl font-display font-bold text-foreground">₨{availableBalance.toFixed(0)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Referral Link */}
                  <Card className="max-w-3xl border-primary/20">
                    <CardHeader>
                      <CardTitle className="font-display flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-primary" /> {t('dash.referral_link')}
                      </CardTitle>
                      <CardDescription dangerouslySetInnerHTML={{ __html: t('dash.referral_desc') }} />
                    </CardHeader>
                    <CardContent>
                      {referralCode ? (
                        <div className="flex gap-2">
                          <Input value={referralLink} readOnly className="flex-1 font-mono text-sm" />
                          <Button
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => {
                              navigator.clipboard.writeText(referralLink);
                              toast.success('Referral link copied!');
                            }}
                          >
                            <Copy className="h-4 w-4" /> {t('dash.copy')}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('dash.loading_referral')}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Your Referrals List */}
                  {referrals.length > 0 && (
                    <Card className="max-w-3xl">
                      <CardHeader>
                        <CardTitle className="font-display text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" /> {t('dash.your_referrals')}
                        </CardTitle>
                        <CardDescription>{t('dash.referrals_desc')}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('dash.school')}</TableHead>
                              <TableHead>{t('dash.joined')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referrals.map(r => (
                              <TableRow key={r.id}>
                                <TableCell className="font-medium">
                                  {r.profiles?.school_name ? maskSchoolName(r.profiles.school_name) : '***'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(new Date(r.created_at), 'dd MMM yyyy')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* How it works */}
                  <Card className="max-w-3xl">
                    <CardHeader>
                      <CardTitle className="font-display text-lg">{t('dash.how_it_works')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="text-2xl mb-2">1️⃣</div>
                          <p className="text-sm font-medium">{t('dash.step1_share')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('dash.step1_share_desc')}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="text-2xl mb-2">2️⃣</div>
                          <p className="text-sm font-medium">{t('dash.step2_buy')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('dash.step2_buy_desc')}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <div className="text-2xl mb-2">3️⃣</div>
                          <p className="text-sm font-medium">{t('dash.step3_earn')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('dash.step3_earn_desc')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Withdraw */}
                  <Card className="max-w-3xl">
                    <CardHeader>
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" /> {t('dash.withdraw')}
                      </CardTitle>
                      <CardDescription>{t('dash.withdraw_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleWithdrawal} className="space-y-4">
                        <p className="text-xs text-muted-foreground">{t('dash.min_withdrawal')}</p>
                        <div className="space-y-2">
                          <Label>{t('dash.withdrawal_amount')}</Label>
                          <Input
                            type="number"
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            placeholder="400"
                            min={400}
                            max={availableBalance}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('dash.payment_method')}</Label>
                          <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easypaisa">Easypaisa</SelectItem>
                              <SelectItem value="jazzcash">JazzCash</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('dash.account_number')}</Label>
                          <Input
                            value={withdrawAccount}
                            onChange={e => setWithdrawAccount(e.target.value)}
                            placeholder="03XXXXXXXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('dash.account_holder')}</Label>
                          <Input
                            value={withdrawName}
                            onChange={e => setWithdrawName(e.target.value)}
                            placeholder="Muhammad Ali"
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={withdrawing || availableBalance < 45}>
                          {withdrawing ? t('dash.submitting') : t('dash.request_withdrawal')}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Withdrawal History */}
                  {withdrawals.length > 0 && (
                    <Card className="max-w-3xl">
                      <CardHeader>
                        <CardTitle className="font-display text-lg">{t('dash.withdrawal_history')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('dash.wd_date')}</TableHead>
                              <TableHead>{t('dash.wd_amount')}</TableHead>
                              <TableHead>{t('dash.wd_method')}</TableHead>
                              <TableHead>{t('dash.wd_account')}</TableHead>
                              <TableHead>{t('dash.wd_status')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {withdrawals.map(w => (
                              <TableRow key={w.id}>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(new Date(w.created_at), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell className="font-mono font-semibold">₨{w.amount}</TableCell>
                                <TableCell className="capitalize">{w.payment_method}</TableCell>
                                <TableCell className="font-mono text-sm">{w.account_number}</TableCell>
                                <TableCell>
                                  <Badge variant={w.status === 'sent' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                                    {w.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Earnings History */}
                  {referralEarnings.length > 0 && (
                    <Card className="max-w-3xl">
                      <CardHeader>
                        <CardTitle className="font-display text-lg">{t('dash.commission_history')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('dash.tx_date')}</TableHead>
                              <TableHead>{t('dash.credits_purchased')}</TableHead>
                              <TableHead>{t('dash.your_commission')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {referralEarnings.map(e => (
                              <TableRow key={e.id}>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(new Date(e.created_at), 'dd MMM yyyy')}
                                </TableCell>
                                <TableCell className="font-mono">{e.credits_purchased}</TableCell>
                                <TableCell className="font-mono font-semibold text-green-600">+₨{(e.commission_rupees || e.commission_credits * 9).toFixed(0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Settings className="h-5 w-5" /> {t('dash.school_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('dash.public_url')}</Label>
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
                      <Check className="h-3.5 w-3.5" /> {t('dash.copy')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('dash.school_name')}</Label>
                  <Input value={school.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{t('dash.accent_color')}</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded" style={{ backgroundColor: school.accent_color }} />
                    <span className="text-sm text-muted-foreground">{school.accent_color}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Card */}
            <QRCodeCard schoolName={school.name} slug={school.slug} />

            {/* Search Fields Config */}
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> {t('dash.search_fields')}
                </CardTitle>
                <CardDescription>{t('dash.search_fields_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'roll_number', label: t('dash.roll_number_field'), hint: t('dash.roll_number_hint') },
                  { id: 'student_name', label: t('dash.student_name_field'), hint: t('dash.student_name_hint') },
                  { id: 'father_name', label: t('dash.father_name_field'), hint: t('dash.father_name_hint') },
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
                          toast.error(t('dash.keep_one_field'));
                          return;
                        }
                        const { error } = await supabase.from('schools').update({ search_fields: updated } as any).eq('id', school.id);
                        if (error) { toast.error(error.message); }
                        else { setSchool({ ...school, search_fields: updated }); toast.success(t('dash.search_fields_updated')); }
                      }}
                    />
                    <div>
                      <Label className="text-sm">{field.label}</Label>
                      <p className="text-xs text-muted-foreground">{field.hint}</p>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">{t('dash.search_fields_note')}</p>
              </CardContent>
            </Card>

            {/* Result Design Template Picker */}
            <div className="space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" /> {t('dash.choose_design')}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('dash.design_desc')}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Free for all plans
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {resultTemplates.map((template) => {
                  const isSelected = (school.result_template || 'luxury-gold') === template.id;
                  return (
                    <button
                      key={template.id}
                    onClick={() => {
                        if (isSelected) return;
                        updateResultTemplate(template.id, template.name);
                      }}
                      className={`group relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30 shadow-md'
                          : 'border-border hover:border-muted-foreground/40'
                      }`}
                    >
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
                          {t('dash.active')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="help" className="mt-6">
            <HelpTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Timer Dialog */}
      <Dialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" /> {t('dash.set_result_timer')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('dash.timer_desc')}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('dash.days')}</Label>
              <Input type="number" min={0} max={365} value={timerDays} onChange={e => setTimerDays(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('dash.hours')}</Label>
              <Input type="number" min={0} max={23} value={timerHours} onChange={e => setTimerHours(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('dash.minutes')}</Label>
              <Input type="number" min={0} max={59} value={timerMinutes} onChange={e => setTimerMinutes(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimerDialogOpen(false)}>{t('dash.cancel')}</Button>
            <Button onClick={handleSetTimer} className="gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" /> {t('dash.start_countdown')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      <Dialog open={columnMappingOpen} onOpenChange={setColumnMappingOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{t('dash.map_columns')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
                      <Label className="text-xs">{t('dash.roll_column')}</Label>
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
                      <Label className="text-xs">{t('dash.name_column')}</Label>
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
                    <Label className="text-xs">{t('dash.father_column')} <span className="text-muted-foreground">{t('dash.father_optional')}</span></Label>
                    <Select value={mapping.fatherKey || '__none__'} onValueChange={val => setSheetMappings(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], fatherKey: val === '__none__' ? '' : val } }))}>
                      <SelectTrigger className="h-8 text-xs min-w-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t('dash.none')}</SelectItem>
                        {mapping.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('dash.subjects_total')}</Label>
                    <p className="text-[11px] text-muted-foreground">{t('dash.subjects_hint')}</p>
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

                  {sheetData.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('dash.sample_preview')}</Label>
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
            <Button variant="outline" onClick={() => setColumnMappingOpen(false)} className="w-full sm:w-auto">{t('dash.cancel')}</Button>
            <Button onClick={handleConfirmUpload} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? t('dash.uploading') : t('dash.upload_results_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />
      <WhatsAppHelpButton />
    </div>
  );
}
