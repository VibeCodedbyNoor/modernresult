import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CLASS_SUBJECTS } from '@/lib/classSubjects';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { PortalSkeleton } from '@/components/LoadingSkeletons';
import LanguageToggle from '@/components/LanguageToggle';

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

export default function ResultPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: schoolData } = await supabase.from('schools').select('*').eq('slug', slug).single();
      if (schoolData) setSchool(schoolData);
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleSearch = useCallback(async (searchParams: { rollNumber?: string; studentName?: string; fatherName?: string; className?: string }) => {
    if (!school) return null;

    const { rollNumber = '', studentName = '', fatherName = '', className = '' } = searchParams;

    const { data: exams } = await supabase
      .from('exams')
      .select('id, name, display_at, is_stopped')
      .eq('school_id', school.id)
      .eq('is_published', true);

    if (!exams || exams.length === 0) return null;

    const exam = exams[0];
    if (exam.is_stopped) return null;
    if (exam.display_at && new Date(exam.display_at).getTime() > Date.now()) return null;

    const { data } = await supabase.rpc('fuzzy_search_results', {
      p_exam_id: exam.id,
      p_class_name: className,
      p_query: studentName.trim(),
      p_roll_number: rollNumber.trim(),
      p_father_name: fatherName.trim(),
    } as any);

    if (data && data.length > 0) {
      const { data: creditOk } = await supabase.rpc('deduct_credit', { p_school_id: school.id });
      if (!creditOk) {
        throw new Error('Result checking service is currently unavailable. Please contact the school.');
      }

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
      const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) + '%' : '0%';
      const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const grade = row.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F');
      const remarks = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 50 ? 'Satisfactory' : 'Needs Improvement';

      return {
        name: row.student_name,
        father_name: (row as any).father_name || '',
        class: row.class_name,
        roll_number: row.roll_number,
        position,
        subjects,
        total_obtained: totalObtained,
        total_marks: totalMax,
        percentage,
        grade,
        remarks,
      };
    }

    return null;
  }, [school]);

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

  return (
    <div className="relative">
      <div className="fixed top-3 right-3 z-50">
        <LanguageToggle className="bg-black/30 backdrop-blur-sm text-white hover:bg-black/50" />
      </div>
      <PortalComponent
        isDemo={false}
        schoolName={school.name}
        logoUrl={school.logo_url}
        onSearch={handleSearch}
        searchFields={school.search_fields || ['roll_number', 'student_name']}
      />
    </div>
  );
}
