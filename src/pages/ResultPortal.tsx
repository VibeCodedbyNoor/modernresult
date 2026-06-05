import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { PortalSkeleton } from '@/components/LoadingSkeletons';
import type { ExamState } from '@/lib/portalTypes';
import ExamStatusBanner from '@/components/portal/ExamStatusBanner';
import SEO from '@/components/SEO';
import AdBanner from '@/components/AdBanner';
import { usePlanBySlug } from '@/hooks/usePlan';
import { normalizeSettings, computeDerived } from '@/lib/examCalculations';
import { generateDMC } from '@/lib/generateDMC';
import { Button } from '@/components/ui/button';
import { Trophy, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import all portal components
import CorporatePortal from './portals/CorporatePortal';
import CyberPunkPortal from './portals/CyberPunkPortal';
import DarkModePortal from './portals/DarkModePortal';
import ElegantPortal from './portals/ElegantPortal';
import FuturisticPortal from './portals/FuturisticPortal';
import GalaxyPortal from './portals/GalaxyPortal';
import GlassmorphismPortal from './portals/GlassmorphismPortal';
import GradientModernPortal from './portals/GradientModernPortal';
import IslamicPortal from './portals/IslamicPortal';
import KawaiiPortal from './portals/KawaiiPortal';
import LuxuryGoldPortal from './portals/LuxuryGoldPortal';
import MaterialDesignPortal from './portals/MaterialDesignPortal';
import MinimalistPortal from './portals/MinimalistPortal';
import MonochromePortal from './portals/MonochromePortal';
import NaturePortal from './portals/NaturePortal';
import NeonPortal from './portals/NeonPortal';
import NeumorphismPortal from './portals/NeumorphismPortal';
import OceanPortal from './portals/OceanPortal';
import PastelPortal from './portals/PastelPortal';
import RetroPortal from './portals/RetroPortal';
import RoyalPurplePortal from './portals/RoyalPurplePortal';
import SunsetPortal from './portals/SunsetPortal';

const PORTAL_MAP: Record<string, React.ComponentType<any>> = {
  'corporate': CorporatePortal,
  'cyberpunk': CyberPunkPortal,
  'dark-mode': DarkModePortal,
  'elegant': ElegantPortal,
  'futuristic': FuturisticPortal,
  'galaxy': GalaxyPortal,
  'glassmorphism': GlassmorphismPortal,
  'gradient-modern': GradientModernPortal,
  'islamic': IslamicPortal,
  'kawaii': KawaiiPortal,
  'luxury-gold': LuxuryGoldPortal,
  'material-design': MaterialDesignPortal,
  'minimalist': MinimalistPortal,
  'monochrome': MonochromePortal,
  'nature': NaturePortal,
  'neon': NeonPortal,
  'neumorphism': NeumorphismPortal,
  'ocean': OceanPortal,
  'pastel': PastelPortal,
  'retro': RetroPortal,
  'royal-purple': RoyalPurplePortal,
  'sunset': SunsetPortal,
};

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  accent_color: string;
  result_template: string;
  search_fields: string[];
}

function computeExamState(exam: { display_at: string | null; is_stopped: boolean; name: string } | null): ExamState {
  if (!exam) return { status: 'no_exam' };
  if (exam.is_stopped) return { status: 'stopped', examName: exam.name };
  if (exam.display_at && new Date(exam.display_at).getTime() > Date.now()) {
    return { status: 'countdown', displayAt: exam.display_at, examName: exam.name };
  }
  return { status: 'active', examName: exam.name };
}

export default function ResultPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [examState, setExamState] = useState<ExamState>({ status: 'no_exam' });
  const [activeExam, setActiveExam] = useState<{ id: string; name: string; display_at: string | null; is_stopped: boolean; search_mode?: string; exam_settings?: any } | null>(null);
  const [examClasses, setExamClasses] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const plan = usePlanBySlug(slug);

  async function fetchClassesForExam(examId: string) {
    const { data } = await supabase.from('results').select('class_name').eq('exam_id', examId);
    const set = new Set<string>();
    (data || []).forEach((r: any) => { if (r.class_name) set.add(r.class_name); });
    setExamClasses(Array.from(set).sort());
  }

  // Load school + exam data
  useEffect(() => {
    async function load() {
      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single();
      if (schoolData) {
        setSchool(schoolData);
        // Fetch published exam
        const { data: exams } = await supabase
          .from('exams')
          .select('id, name, display_at, is_stopped, search_mode, exam_settings')
          .eq('school_id', schoolData.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1);

        const exam = exams?.[0] || null;
        setActiveExam(exam);
        setExamState(computeExamState(exam));
        if (exam) await fetchClassesForExam(exam.id);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Realtime: listen for school changes (template, name, logo, search_fields)
  useEffect(() => {
    if (!school) return;

    const schoolChannel = supabase
      .channel(`school-${school.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'schools',
        filter: `id=eq.${school.id}`,
      }, (payload) => {
        const updated = payload.new as any;
        setSchool(prev => prev ? { ...prev, ...updated } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(schoolChannel); };
  }, [school?.id]);

  // Realtime: listen for exam changes (start/stop/schedule)
  useEffect(() => {
    if (!school) return;

    const examChannel = supabase
      .channel(`exams-${school.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'exams',
        filter: `school_id=eq.${school.id}`,
      }, async () => {
        // Re-fetch the active published exam
        const { data: exams } = await supabase
          .from('exams')
          .select('id, name, display_at, is_stopped, search_mode, exam_settings')
          .eq('school_id', school.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1);

        const exam = exams?.[0] || null;
        setActiveExam(exam);
        setExamState(computeExamState(exam));
        if (exam) await fetchClassesForExam(exam.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(examChannel); };
  }, [school?.id]);

  // Re-check countdown expiry every second (for countdown → active transition)
  useEffect(() => {
    if (examState.status !== 'countdown') return;
    const interval = setInterval(() => {
      setExamState(computeExamState(activeExam));
    }, 1000);
    return () => clearInterval(interval);
  }, [examState.status, activeExam]);

  const handleSearch = useCallback(async (searchParams: { rollNumber?: string; studentName?: string; fatherName?: string; className?: string }) => {
    if (!school || !activeExam) return null;

    // Re-check exam state at search time
    const currentState = computeExamState(activeExam);
    if (currentState.status === 'stopped') {
      throw new Error('Result checking is currently paused by the school.');
    }
    if (currentState.status === 'countdown') {
      throw new Error('Results are not available yet. Please wait for the countdown to finish.');
    }
    if (currentState.status === 'no_exam') {
      throw new Error('No results have been published yet.');
    }

    const { rollNumber = '', studentName = '', fatherName = '', className = '' } = searchParams;

    const { data } = await supabase.rpc('fuzzy_search_results', {
      p_exam_id: activeExam.id,
      p_class_name: className,
      p_query: studentName.trim(),
      p_roll_number: rollNumber.trim(),
      p_father_name: fatherName.trim(),
    } as any);

    if (data && data.length > 0) {
      const row = data[0];
      const rawSubjects = row.subjects as any;
      let subjects: any[] = [];
      let position: string | number = '-';

      if (Array.isArray(rawSubjects)) {
        subjects = rawSubjects;
      } else if (typeof rawSubjects === 'object' && rawSubjects !== null) {
        if ('Position' in rawSubjects) {
          position = rawSubjects.Position;
        }
        const classConfig = CLASS_SUBJECTS[row.class_name] || [];
        subjects = Object.entries(rawSubjects)
          .filter(([key]) => key !== 'Position')
          .map(([name, value]) => {
            const val = value as any;
            const config = classConfig.find(c => c.subject.toLowerCase() === name.toLowerCase());
            return {
              subject: config?.subject || name,
              obtained_marks: typeof val === 'object' ? Number(val.obtained) || 0 : Number(val) || 0,
              total_marks: typeof val === 'object' ? Number(val.total) || 0 : config?.total_marks || 100,
            };
          });
      }

      const totalObtained = subjects.reduce((sum: number, s: any) => sum + (Number(s.obtained_marks) || 0), 0);
      const totalMax = subjects.reduce((sum: number, s: any) => sum + (Number(s.total_marks) || 0), 0);
      const settings = normalizeSettings(activeExam?.exam_settings);
      const derived = computeDerived({ subjects, raw: rawSubjects, position }, settings);

      const result = {
        name: row.student_name,
        father_name: (row as any).father_name || '',
        class: row.class_name,
        roll_number: row.roll_number,
        position: derived.position,
        subjects,
        total_obtained: totalObtained,
        total_marks: totalMax,
        percentage: derived.percentage,
        grade: derived.grade,
        status: derived.status,
        remarks: derived.remarks,
      };
      setLastResult(result);
      return result;
    }

    return null;
  }, [school, activeExam]);

  if (loading) {
    return <PortalSkeleton />;
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

  const templateId = school.result_template || 'luxury-gold';
  const PortalComponent = PORTAL_MAP[templateId] || LuxuryGoldPortal;

  // Determine if this is a dark-themed template
  const darkTemplates = ['cyberpunk', 'dark-mode', 'futuristic', 'galaxy', 'glassmorphism', 'luxury-gold', 'monochrome', 'neon', 'ocean', 'nature', 'islamic', 'sunset', 'royal-purple'];
  const bannerVariant = darkTemplates.includes(templateId) ? 'dark' : 'light';

  const isDisabled = examState.status !== 'active';



  return (
    <div className={plan === 'free' ? 'relative pb-20 md:pb-0' : 'relative'}>
      <SEO
        title={`${school.name} — Check Exam Results Online`}
        description={`Official online result portal for ${school.name}. Enter your roll number to instantly check your latest exam results.`}
        path={`/results/${school.slug}`}
      />
      <AdBanner plan={plan} slot="top" />
      <div className={isDisabled ? 'pointer-events-none opacity-50 select-none' : ''}>
        <PortalComponent
          isDemo={false}
          schoolName={school.name}
          logoUrl={school.logo_url}
          onSearch={handleSearch}
          searchFields={
            activeExam?.search_mode === 'name' ? ['student_name']
            : activeExam?.search_mode === 'both' ? ['roll_number', 'student_name']
            : activeExam?.search_mode === 'roll_number' ? ['roll_number']
            : (school.search_fields || ['roll_number', 'student_name'])
          }
          availableClasses={examClasses}
          hideClassSelector={activeExam?.search_mode === 'roll_number' || examClasses.length <= 1}
          examState={examState}
        />
      </div>

      {/* Merit list link — always visible on portal */}
      {activeExam && (
        <div className="max-w-4xl mx-auto px-4 pt-3 flex justify-center">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to={`/results/${school.slug}/merit?exam=${activeExam.id}`}>
              <Trophy className="h-4 w-4 text-amber-500" /> View Merit List
            </Link>
          </Button>
        </div>
      )}

      {/* Pro-only DMC download */}
      {plan === 'pro' && lastResult && (
        <div className="fixed inset-x-0 bottom-0 z-30 md:static md:max-w-4xl md:mx-auto md:my-4 px-3 py-2 bg-background/95 backdrop-blur border-t md:border md:rounded-xl md:shadow-md flex gap-2">
          <Button
            className="flex-1 gap-1.5"
            onClick={() => generateDMC({
              schoolName: school.name,
              logoUrl: school.logo_url,
              examName: activeExam?.name || '',
              studentName: lastResult.name,
              fatherName: lastResult.father_name,
              rollNumber: lastResult.roll_number,
              className: lastResult.class,
              subjects: lastResult.subjects,
              totalObtained: lastResult.total_obtained,
              totalMarks: lastResult.total_marks,
              percentage: lastResult.percentage,
              grade: lastResult.grade,
              position: lastResult.position,
              status: lastResult.status || 'PASS',
            }, (school as any).dmc_settings || {})}
          >
            <FileDown className="h-4 w-4" /> Download Marksheet (PDF)
          </Button>
        </div>
      )}

      <AdBanner plan={plan} slot="bottom" />
      {isDisabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <ExamStatusBanner examState={examState} variant={bannerVariant} />
        </div>
      )}
    </div>
  );
}
