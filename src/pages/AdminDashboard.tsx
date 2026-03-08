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
import { School, CreditCard, Users, BookOpen, Search, Plus, MessageCircle, LogOut, ArrowUpDown, Phone, User, Wallet, CheckCircle, Ban, Clock } from 'lucide-react';

interface SchoolWithCredits {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  credit_balance: number;
  owner_name?: string;
  whatsapp_number?: string;
  owner_email?: string;
}

interface TransactionRow {
  id: string;
  school_id: string;
  school_name: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
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
  const [schools, setSchools] = useState<SchoolWithCredits[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithCredits | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [lastUpdate, setLastUpdate] = useState<{ school: string; amount: number; newBalance: number } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'transactions' | 'referrals'>('overview');
  const [earnEnabled, setEarnEnabled] = useState(false);
  const [earnToggling, setEarnToggling] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

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
      .select('id, name, slug, owner_id, created_at');

    const { data: creditsData } = await supabase
      .from('school_credits')
      .select('school_id, balance');

    const { data: examsData } = await supabase
      .from('exams')
      .select('id', { count: 'exact' });

    const { data: txData } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Load profiles for owner info
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, owner_name, whatsapp_number');

    if (schoolsData && creditsData) {
      const creditMap = new Map(creditsData.map(c => [c.school_id, c.balance]));
      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, { owner_name: p.owner_name, whatsapp_number: p.whatsapp_number }])
      );
      
      const merged: SchoolWithCredits[] = schoolsData.map(s => {
        const profile = profileMap.get(s.owner_id);
        return {
          ...s,
          credit_balance: creditMap.get(s.id) ?? 0,
          owner_name: profile?.owner_name || '',
          whatsapp_number: profile?.whatsapp_number || '',
        };
      });
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSchools(merged);
    }

    setTotalExams(examsData?.length ?? 0);

    if (txData && schoolsData) {
      const schoolMap = new Map(schoolsData.map(s => [s.id, s.name]));
      setTransactions(txData.map(t => ({
        ...t,
        school_name: schoolMap.get(t.school_id) ?? 'Unknown',
      })));
    }

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

  const handleAddCredits = async () => {
    if (!selectedSchool || !creditAmount || parseInt(creditAmount) <= 0) {
      toast({ title: 'Please select a school and enter valid credit amount', variant: 'destructive' });
      return;
    }

    setUpdating(true);
    try {
      const { data: newBalance, error } = await supabase.rpc('add_credits_admin', {
        p_school_id: selectedSchool.id,
        p_amount: parseInt(creditAmount),
        p_description: `Admin top-up: ${creditAmount} credits`,
      });

      if (error) throw error;

      setLastUpdate({
        school: selectedSchool.name,
        amount: parseInt(creditAmount),
        newBalance: newBalance as number,
      });

      // Auto-fill WhatsApp number from profile
      if (selectedSchool.whatsapp_number) {
        setWhatsappNumber(selectedSchool.whatsapp_number);
      }

      toast({ title: `✅ ${creditAmount} credits added to ${selectedSchool.name}!` });
      setCreditAmount('');
      setSelectedSchool(null);
      setSearchQuery('');
      loadData();
    } catch (err: any) {
      toast({ title: 'Failed to add credits', description: err.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!lastUpdate) return '';
    return `🎉 Assalam o Alaikum!

Dear ${lastUpdate.school} Team,

Great news! *${lastUpdate.amount} credits* have been successfully added to your ResultCheck account! ✅

📊 Your updated balance: *${lastUpdate.newBalance} credits*

Keep delivering instant, professional results to your students! Every result you publish builds trust with parents and strengthens your school's reputation. 💪📚

Need more credits? Just reach out anytime!

— ResultCheck Team
resultportal.online`;
  };

  const openWhatsApp = () => {
    const num = whatsappNumber.replace(/\D/g, '');
    if (!num) {
      toast({ title: 'Please enter a WhatsApp number', variant: 'destructive' });
      return;
    }
    const msg = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCredits = schools.reduce((sum, s) => sum + s.credit_balance, 0);
  const todayTx = transactions.filter(t => {
    const today = new Date();
    const txDate = new Date(t.created_at);
    return txDate.toDateString() === today.toDateString();
  });

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
              <p className="text-xs text-muted-foreground">ResultCheck Platform Management</p>
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
                  <CreditCard className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCredits}</p>
                  <p className="text-xs text-muted-foreground">Credits in Circulation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <ArrowUpDown className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{todayTx.length}</p>
                  <p className="text-xs text-muted-foreground">Transactions Today</p>
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
          {(['overview', 'credits', 'transactions', 'referrals'] as const).map(tab => (
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
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Credits</TableHead>
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
                        {school.whatsapp_number ? (
                          <a
                            href={`https://wa.me/${school.whatsapp_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm text-green-600 hover:underline"
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
                        <Badge variant={school.credit_balance > 0 ? 'default' : 'destructive'}>
                          {school.credit_balance}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(school.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSchool(school);
                            setActiveTab('credits');
                            if (school.whatsapp_number) setWhatsappNumber(school.whatsapp_number);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Credits
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSchools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No schools found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Credits</CardTitle>
                <CardDescription>Search for a school and add credits to their account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search School</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Type school name..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setSelectedSchool(null); }}
                      className="pl-9"
                    />
                  </div>
                  {searchQuery && !selectedSchool && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredSchools.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSchool(s);
                            setSearchQuery(s.name);
                            if (s.whatsapp_number) setWhatsappNumber(s.whatsapp_number);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{s.name}</span>
                            {s.owner_name && <span className="text-muted-foreground ml-2 text-xs">({s.owner_name})</span>}
                          </div>
                          <Badge variant="secondary">{s.credit_balance} credits</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedSchool && (
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <p className="font-medium text-foreground">{selectedSchool.name}</p>
                    {selectedSchool.owner_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> {selectedSchool.owner_name}
                      </p>
                    )}
                    {selectedSchool.whatsapp_number && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {selectedSchool.whatsapp_number}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Current balance: <span className="font-bold text-primary">{selectedSchool.credit_balance}</span> credits
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Credits to Add</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter amount..."
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAddCredits}
                  disabled={!selectedSchool || !creditAmount || updating}
                  className="w-full"
                >
                  {updating ? 'Adding...' : 'Add Credits'}
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Notification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  Send Notification
                </CardTitle>
                <CardDescription>
                  {lastUpdate
                    ? `Notify ${lastUpdate.school} about their credit update`
                    : 'Add credits first to send a notification'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastUpdate ? (
                  <>
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm whitespace-pre-line text-foreground">
                      {generateWhatsAppMessage()}
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Number (with country code)</Label>
                      <Input
                        placeholder="923001234567"
                        value={whatsappNumber}
                        onChange={e => setWhatsappNumber(e.target.value)}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {whatsappNumber ? '✓ Auto-filled from school profile' : 'Enter number manually'}
                      </p>
                    </div>
                    <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send via WhatsApp
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p>Add credits to a school to generate a notification message</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 100 credit transactions across all schools</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.school_name}</TableCell>
                      <TableCell>
                        <Badge variant={tx.amount > 0 ? 'default' : 'secondary'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={tx.amount > 0 ? 'text-green-600 font-bold' : 'text-red-500'}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tx.description ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(tx.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
