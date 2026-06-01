import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Check, Star, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

const WA_NUMBER = '923478312432';
const PRO_PRICE = '$20/month';

const PRO_FEATURES = [
  'Zero ads on result pages',
  'All 22+ premium themes',
  'Custom logo and brand colors',
  'Branded PDF marksheet (DMC) download',
  'Password protect exams',
  'Countdown timer for result announcement',
  'Merit list / top students page',
  'Priority WhatsApp support',
];

export default function Billing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null);
  const [schoolName, setSchoolName] = useState('');
  const [stats, setStats] = useState({ exams: 0, students: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login?redirect=/dashboard/billing');
      return;
    }
    (async () => {
      const { data: school } = await supabase
        .from('schools')
        .select('id, name, plan')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (!school) return;
      setPlan(((school as any).plan === 'pro' ? 'pro' : 'free'));
      setSchoolName(school.name);
      const [{ count: examCount }, { data: examIds }] = await Promise.all([
        supabase.from('exams').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        supabase.from('exams').select('id').eq('school_id', school.id),
      ]);
      const ids = (examIds || []).map((e: any) => e.id);
      let students = 0;
      if (ids.length) {
        const { count } = await supabase
          .from('results')
          .select('id', { count: 'exact', head: true })
          .in('exam_id', ids);
        students = count || 0;
      }
      setStats({ exams: examCount || 0, students });
    })();
  }, [user, loading, navigate]);

  const waText = encodeURIComponent(
    `Assalam o Alaikum! I want to upgrade "${schoolName || 'my school'}" to the Pro plan ($20/month). Please activate it for me.`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waText}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Billing & Plan — ResultPortal" description="Manage your ResultPortal plan." path="/dashboard/billing" />
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <span className="font-display font-bold text-primary">Billing & Plan</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{schoolName}</p>
            </div>
            {plan === 'pro' ? (
              <Badge className="bg-amber-500 text-black hover:bg-amber-500 text-sm px-3 py-1">
                <Star className="h-3.5 w-3.5 mr-1 fill-current" /> Pro Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-sm px-3 py-1">Free</Badge>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Exams created</p>
              <p className="text-2xl font-bold mt-1">{stats.exams}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Students published</p>
              <p className="text-2xl font-bold mt-1">{stats.students}</p>
            </div>
          </CardContent>
        </Card>

        {plan === 'pro' ? (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-current" /> Pro plan active
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your Pro plan is managed manually by our team. Contact support for any changes.
              </p>
              <a href={waLink} target="_blank" rel="noreferrer">
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-4 w-4" /> Contact Support
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="text-xl">Upgrade to Pro — {PRO_PRICE}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                To activate Pro plan, contact us on WhatsApp and we will set it up for you within a few hours.
              </p>
              <a href={waLink} target="_blank" rel="noreferrer" className="inline-block">
                <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <MessageCircle className="h-5 w-5" /> Contact on WhatsApp
                </Button>
              </a>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>WhatsApp: <a className="text-primary hover:underline" href={waLink}>+92 347 8312432</a></p>
                <p>Available: Mon–Sat, 9am–9pm PKT</p>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm font-semibold mb-3">What you unlock with Pro:</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
