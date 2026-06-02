import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { School, Users, BookOpen, Search, LogOut, Phone, User, Wallet, CheckCircle, Ban, Clock, Trash2, LogIn, Star } from 'lucide-react';

interface SchoolWithPlan {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  owner_name?: string;
  whatsapp_number?: string;
  owner_email?: string;
  invited_by?: string;
  plan?: 'free' | 'pro';
}


interface WithdrawalRow {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  account_name: string;
  account_number: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [schools, setSchools] = useState<SchoolWithPlan[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals'>('overview');
  const [earnEnabled, setEarnEnabled] = useState(false);
  const [earnToggling, setEarnToggling] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<string | null>(null);
  const [loginAsId, setLoginAsId] = useState<string | null>(null);

  const handleLoginAs = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Log in as the owner of "${schoolName}"? You will be signed out of your admin account.`)) return;
    setLoginAsId(schoolId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-login-as', {
        body: { school_id: schoolId, redirect_to: `${window.location.origin}/dashboard` },
      });
      if (error || !data?.action_link) throw new Error(error?.message || data?.error || 'Failed');
      toast({ title: `Opening ${schoolName} session…` });
      window.location.href = data.action_link;
    } catch (err: any) {
      toast({ title: 'Login as failed', description: err.message, variant: 'destructive' });
      setLoginAsId(null);
    }
  };

  const handleTogglePlan = async (school: SchoolWithPlan) => {
    const current = school.plan === 'pro' ? 'pro' : 'free';
    const next = current === 'pro' ? 'free' : 'pro';
    if (!confirm(`Set "${school.name}" to ${next === 'pro' ? 'Pro ⭐' : 'Free'} plan?`)) return;
    const { error } = await supabase.rpc('set_school_plan' as any, {
      p_school_id: school.id,
      p_plan: next,
    });
    if (error) {
      toast({ title: 'Failed to update plan', description: error.message, variant: 'destructive' });
      return;
    }
    setSchools((prev) => prev.map((s) => (s.id === school.id ? { ...s, plan: next } : s)));
    toast({ title: `${school.name} → ${next.toUpperCase()} plan` });
  };


  // Check admin role
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login?redirect=/admin'); return; }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!data) {
        navigate('/dashboard');
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [user, authLoading, navigate]);

  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    // Load schools
    const { data: schoolsData } = await supabase
      .from('schools')
      .select('id, name, slug, owner_id, created_at, plan');


    const { data: examsData } = await supabase
      .from('exams')
      .select('id', { count: 'exact' });


    // Load profiles for owner info
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, owner_name, whatsapp_number, school_name');

    const { data: referralsData } = await supabase
      .from('referrals')
      .select('referrer_id, referred_user_id');

    if (schoolsData) {
      const profileMap = new Map(
        (profilesData || []).map(p => [
          p.user_id,
          { owner_name: p.owner_name, whatsapp_number: p.whatsapp_number, school_name: p.school_name },
        ])
      );
      const referralMap = new Map((referralsData || []).map(r => [r.referred_user_id, r.referrer_id]));
      const schoolByOwnerMap = new Map(schoolsData.map(s => [s.owner_id, s.name]));

      const merged: SchoolWithPlan[] = schoolsData.map(s => {
        const profile = profileMap.get(s.owner_id);
        const referrerId = referralMap.get(s.owner_id);
        const referrerProfile = referrerId ? profileMap.get(referrerId) : undefined;

        return {
          ...s,
          plan: ((s as any).plan === 'pro' ? 'pro' : 'free') as 'free' | 'pro',
          owner_name: profile?.owner_name || '',
          whatsapp_number: profile?.whatsapp_number || '',
          invited_by: referrerId
            ? (referrerProfile?.school_name || referrerProfile?.owner_name || schoolByOwnerMap.get(referrerId) || '—')
            : '—',
        };
      });
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSchools(merged);
    }

    setTotalExams(examsData?.length ?? 0);


    // Load earn_with_us setting
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'earn_with_us')
      .maybeSingle();
    if (settingData?.value && typeof settingData.value === 'object' && 'enabled' in (settingData.value as any)) {
      setEarnEnabled((settingData.value as any).enabled === true);
    }

    // Load withdrawal requests
    const { data: wdData } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (wdData && profilesData) {
      const profileMap2 = new Map(
        (profilesData || []).map(p => [p.user_id, { owner_name: p.owner_name }])
      );
      setWithdrawals(wdData.map(w => ({
        ...w,
        owner_name: profileMap2.get(w.user_id)?.owner_name || 'Unknown',
      })));
    }
  };


  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.invited_by || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    setDeletingSchool(schoolId);
    try {
      const { error } = await supabase.rpc('admin_delete_school', { p_school_id: schoolId });
      if (error) throw error;
      toast({ title: `🗑️ "${schoolName}" and all its data have been deleted.` });
      loadData();
    } catch (err: any) {
      toast({ title: 'Failed to delete school', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingSchool(null);
    }
  };

  const proSchools = schools.filter(s => s.plan === 'pro').length;
  const freeSchools = schools.length - proSchools;

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">OnlineResultPortal Platform Management</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/login'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{schools.length}</p>
                  <p className="text-xs text-muted-foreground">Total Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{proSchools}</p>
                  <p className="text-xs text-muted-foreground">Pro Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{freeSchools}</p>
                  <p className="text-xs text-muted-foreground">Free Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalExams}</p>
                  <p className="text-xs text-muted-foreground">Total Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          {(['overview', 'referrals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>All Schools</CardTitle>
              <CardDescription>Complete list of registered schools with owner details</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by school, owner name, or slug..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Slug</TableHead>

                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map(school => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>
                        {school.owner_name ? (
                          <span className="flex items-center gap-1.5 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {school.owner_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{school.invited_by || '—'}</span>
                      </TableCell>
                      <TableCell>
                        {school.whatsapp_number ? (
                          <a
                            href={`https://wa.me/${school.whatsapp_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {school.whatsapp_number}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell><Badge variant="secondary">{school.slug}</Badge></TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant={school.plan === 'pro' ? 'default' : 'outline'}
                          className={school.plan === 'pro' ? 'bg-amber-500 text-black hover:bg-amber-600' : ''}
                          onClick={() => handleTogglePlan(school)}
                          title="Click to toggle plan"
                        >
                          {school.plan === 'pro' ? '⭐ Pro' : 'Free'}
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(school.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loginAsId === school.id}
                            onClick={() => handleLoginAs(school.id, school.name)}
                          >
                            <LogIn className="h-3 w-3 mr-1" /> {loginAsId === school.id ? '...' : 'Login as'}
                          </Button>


                          {school.owner_id !== user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={deletingSchool === school.id}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{school.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>{school.name}</strong> and ALL associated data including exams, results, referrals, and withdrawal requests. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSchool(school.id, school.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Everything
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSchools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No schools found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}


        {/* Referrals & Withdrawals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {/* Earn With Us Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Earn With Us Page</h3>
                    <p className="text-sm text-muted-foreground">Show or hide the "Earn With Us" link on the landing page</p>
                  </div>
                  <Switch
                    checked={earnEnabled}
                    disabled={earnToggling}
                    onCheckedChange={async (checked) => {
                      setEarnToggling(true);
                      const { error } = await supabase
                        .from('site_settings')
                        .update({ value: { enabled: checked } as any, updated_at: new Date().toISOString() })
                        .eq('key', 'earn_with_us');
                      if (error) {
                        toast({ title: 'Failed to update setting', variant: 'destructive' });
                      } else {
                        setEarnEnabled(checked);
                        toast({ title: `Earn With Us ${checked ? 'enabled' : 'disabled'}` });
                      }
                      setEarnToggling(false);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" /> Withdrawal Requests
                </CardTitle>
                <CardDescription>Manage affiliate payout requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No withdrawal requests yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map(w => (
                        <TableRow key={w.id}>
                          <TableCell className="font-medium">{w.owner_name || 'Unknown'}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{w.payment_method}</Badge></TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{w.account_name}</p>
                              <p className="text-xs text-muted-foreground">{w.account_number}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">{w.amount}</TableCell>
                          <TableCell>
                            {w.status === 'pending' && <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>}
                            {w.status === 'processing' && <Badge className="gap-1 bg-yellow-500"><Clock className="h-3 w-3" /> Processing</Badge>}
                            {(w.status === 'sent' || w.status === 'successful') && <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Sent</Badge>}
                            {w.status === 'rejected' && <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Rejected</Badge>}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {(w.status === 'pending' || w.status === 'processing') && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  disabled={updatingWithdrawal === w.id}
                                  onClick={async () => {
                                    setUpdatingWithdrawal(w.id);
                                    await supabase
                                      .from('withdrawal_requests')
                                      .update({ status: 'sent', updated_at: new Date().toISOString() })
                                      .eq('id', w.id);
                                    toast({ title: 'Marked as sent ✅' });
                                    loadData();
                                    setUpdatingWithdrawal(null);
                                  }}
                                >
                                  ✓ Sent
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  disabled={updatingWithdrawal === w.id}
                                  onClick={async () => {
                                    setUpdatingWithdrawal(w.id);
                                    await supabase
                                      .from('withdrawal_requests')
                                      .update({ status: 'rejected', updated_at: new Date().toISOString() })
                                      .eq('id', w.id);
                                    toast({ title: 'Marked as rejected' });
                                    loadData();
                                    setUpdatingWithdrawal(null);
                                  }}
                                >
                                  ✗ Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
