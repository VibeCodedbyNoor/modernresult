import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Copy, Users, Wallet, ArrowRight, CheckCircle, Share2, UserPlus, CreditCard, Clock, Ban } from 'lucide-react';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export default function EarnWithUs() {
  const { user, loading: authLoading } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // Withdrawal form
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  useEffect(() => {
    if (!user) { setLoadingData(false); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);

    // Get referral code
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('user_id', user.id)
      .single();
    if (profile?.referral_code) setReferralCode(profile.referral_code);

    // Get referrals with email (masked)
    const { data: refs } = await supabase
      .from('referrals')
      .select('id, referred_user_id, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
    
    // For each referral, get the referred user's profile
    if (refs && refs.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, owner_name, school_name')
        .in('user_id', refs.map(r => r.referred_user_id));

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      setReferrals(refs.map(r => ({
        ...r,
        profile: profileMap.get(r.referred_user_id),
      })));
    } else {
      setReferrals([]);
    }

    // Get earnings
    const { data: earns } = await supabase
      .from('referral_earnings')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
    setEarnings(earns || []);
    const total = (earns || []).reduce((s, e) => s + (e.commission_rupees || e.commission_credits * 9), 0);
    setTotalEarnings(total);

    // Get withdrawals
    const { data: wds } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setWithdrawals(wds || []);
    const withdrawn = (wds || []).filter(w => w.status === 'sent' || w.status === 'successful').reduce((s, w) => s + w.amount, 0);
    const pending = (wds || []).filter(w => w.status === 'pending' || w.status === 'processing').reduce((s, w) => s + w.amount, 0);
    setTotalWithdrawn(withdrawn);
    setPendingWithdrawal(pending);

    setLoadingData(false);
  };

  const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawal;

  const copyLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const handleWithdraw = async () => {
    if (!user) return;
    if (!accountName.trim() || !accountNumber.trim() || !withdrawAmount) {
      toast.error('Please fill all fields');
      return;
    }
    const amt = parseInt(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amt > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount: amt,
      payment_method: paymentMethod,
      account_name: accountName.trim(),
      account_number: accountNumber.trim(),
    });

    if (error) {
      toast.error('Failed to submit withdrawal request');
      setSubmitting(false);
      return;
    }

    setWithdrawalSuccess(true);
    setSubmitting(false);
    setAccountName('');
    setAccountNumber('');
    setWithdrawAmount('');
    loadData();
    setTimeout(() => setWithdrawalSuccess(false), 5000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'processing': return <Badge className="gap-1 bg-yellow-500"><Clock className="h-3 w-3" /> Processing</Badge>;
      case 'sent': case 'successful': return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Sent</Badge>;
      case 'rejected': return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Landing section for non-logged-in or as intro
  const heroSection = (
    <div className="text-center space-y-6 py-12 sm:py-20">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
        💰 Earn Money With Us
      </div>
      <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight" style={{ color: '#f1f0f5' }}>
        Share. Refer. <span style={{ color: '#22c55e' }}>Earn.</span>
      </h1>
      <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#a5a4b8' }}>
        Invite school owners to OnlineResultPortal and earn <span className="font-bold" style={{ color: '#22c55e' }}>10% commission in PKR</span> on every rupee they spend. No limits. Forever.
      </p>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-10">
        {[
          { icon: <UserPlus className="h-6 w-6" style={{ color: '#a78bfa' }} />, title: 'Sign Up Free', desc: 'Create your account and get a unique referral link automatically' },
          { icon: <Share2 className="h-6 w-6" style={{ color: '#22c55e' }} />, title: 'Share Your Link', desc: 'Send your link to school owners who need an online result portal' },
          { icon: <Wallet className="h-6 w-6" style={{ color: '#f59e0b' }} />, title: 'Earn 10% in PKR', desc: 'When they recharge, you earn 10% of the PKR amount — withdraw anytime via JazzCash / Easypaisa' },
        ].map(step => (
          <div key={step.title} className="rounded-xl p-6 text-center space-y-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {step.icon}
            </div>
            <h3 className="font-semibold" style={{ color: '#f1f0f5' }}>{step.title}</h3>
            <p className="text-sm" style={{ color: '#8b8a9e' }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Motivational copy */}
      <div className="max-w-2xl mx-auto rounded-xl p-6 mt-8 space-y-4"
        style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(34,197,94,0.06))', border: '1px solid rgba(167,139,250,0.15)' }}>
        <h3 className="text-lg font-bold" style={{ color: '#f1f0f5' }}>🔥 Why This Is a No-Brainer</h3>
        <ul className="text-left space-y-2 text-sm" style={{ color: '#c4c3d4' }}>
          {[
            'Every school in your area needs this — be the one who tells them first',
            'Earn passive income. Once they sign up, every purchase earns you money',
            'No investment required — just share your link',
            'Unlimited referrals, unlimited earnings — there\'s no cap',
            'Withdraw your earnings via JazzCash or Easypaisa anytime',
          ].map(t => (
            <li key={t} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#22c55e' }} /> {t}
            </li>
          ))}
        </ul>
      </div>

      {!user && (
        <div className="pt-4">
          <Link to="/signup">
            <Button size="lg" className="gap-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>
              Create Free Account & Start Earning <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  // Dashboard for logged-in users
  const dashboard = user && (
    <div className="space-y-6 py-8">
      <h2 className="text-2xl font-bold font-display" style={{ color: '#f1f0f5' }}>Your Referral Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: referrals.length, icon: <Users className="h-5 w-5 text-primary" />, prefix: '' },
          { label: 'Total Earned', value: totalEarnings, icon: <Wallet className="h-5 w-5" style={{ color: '#22c55e' }} />, prefix: '₨' },
          { label: 'Withdrawn', value: totalWithdrawn, icon: <CreditCard className="h-5 w-5" style={{ color: '#f59e0b' }} />, prefix: '₨' },
          { label: 'Available', value: availableBalance, icon: <Wallet className="h-5 w-5" style={{ color: '#a78bfa' }} />, prefix: '₨' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 space-y-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">{s.icon}<span className="text-xs" style={{ color: '#8b8a9e' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: '#f1f0f5' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="rounded-xl p-5 space-y-3"
        style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <p className="text-sm font-medium" style={{ color: '#c4c3d4' }}>Your Referral Link</p>
        <div className="flex gap-2">
          <Input
            readOnly
            value={`${window.location.origin}/signup?ref=${referralCode}`}
            className="bg-background/50 text-foreground"
          />
          <Button onClick={copyLink} variant="outline" className="gap-2 shrink-0">
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      </div>

      {/* Referrals List */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#f1f0f5' }}>People Who Joined ({referrals.length})</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#6b6a80' }}>
            No referrals yet. Share your link to start earning!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.profile?.owner_name 
                      ? `${r.profile.owner_name.slice(0, 3)}***` 
                      : 'User'}
                    {r.profile?.school_name && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({r.profile.school_name.slice(0, 4)}***)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Earnings History */}
      {earnings.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#f1f0f5' }}>Earnings History</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credits Purchased</TableHead>
                <TableHead>Your Commission (10%)</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.credits_purchased}</TableCell>
                  <TableCell className="font-bold" style={{ color: '#22c55e' }}>+{e.commission_credits}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Withdrawal Form */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Withdraw Earnings</CardTitle>
            <CardDescription>Available balance: <span className="font-bold text-primary">{availableBalance}</span> credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {withdrawalSuccess && (
              <div className="rounded-lg p-4 text-sm text-center space-y-1" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                <CheckCircle className="h-5 w-5 mx-auto" />
                <p className="font-medium">Request Submitted!</p>
                <p style={{ color: '#a5a4b8' }}>Payment processing takes up to 2 business days.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex gap-2">
                {['jazzcash', 'easypaisa'].map(m => (
                  <Button
                    key={m}
                    type="button"
                    variant={paymentMethod === m ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod(m)}
                    className="capitalize"
                  >
                    {m === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Muhammad Ahmad" />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="03001234567" />
            </div>
            <div className="space-y-2">
              <Label>Amount (Credits)</Label>
              <Input type="number" min="1" max={availableBalance} value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            <Button onClick={handleWithdraw} disabled={submitting || availableBalance <= 0} className="w-full">
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </Button>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No withdrawals yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map(w => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#f1f0f5' }}>{w.amount} credits</p>
                      <p className="text-xs capitalize" style={{ color: '#8b8a9e' }}>{w.payment_method} • {w.account_number}</p>
                      <p className="text-xs" style={{ color: '#6b6a80' }}>{new Date(w.created_at).toLocaleDateString()}</p>
                    </div>
                    {statusBadge(w.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0b14 0%, #0f1021 50%, #0a0b14 100%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold" style={{ color: '#a78bfa' }}>
            OnlineResultPortal
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 text-xs">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="text-xs px-3" style={{ background: 'linear-gradient(90deg, #a78bfa, #6d28d9)', color: '#fff' }}>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-4xl">
        {heroSection}
        {!loadingData && dashboard}
        {loadingData && user && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
