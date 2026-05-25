import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Phone, School, Mail } from 'lucide-react';
import SEO from '@/components/SEO';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { COUNTRIES, Country } from '@/lib/countryCodes';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!ownerName.trim() || !schoolName.trim() || !whatsappNumber.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const nationalDigits = whatsappNumber.replace(/\D/g, '').replace(/^0+/, '');
    const waClean = `${country.dial}${nationalDigits}`;
    if (!/^\+\d{8,15}$/.test(waClean) || nationalDigits.length < 6) {
      toast.error('Enter a valid WhatsApp number');
      return;
    }

    setLoading(true);

    // Pre-check IP signup limit
    try {
      const { data: ipCheck } = await supabase.functions.invoke('signup-ip-limit', {
        body: { action: 'check' },
      });
      if (ipCheck && ipCheck.allowed === false) {
        setLoading(false);
        toast.error('Signup limit reached for this network (max 3). Contact +923478312432 on WhatsApp.');
        return;
      }
    } catch (err) {
      console.error('IP check failed:', err);
    }

    const { error } = await signUp(email, password);
    
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      try {
        const { data: ipRec } = await supabase.functions.invoke('signup-ip-limit', {
          body: { action: 'record', user_id: newUser.id },
        });
        if (ipRec && ipRec.allowed === false) {
          await supabase.auth.signOut();
          setLoading(false);
          toast.error('Signup limit reached. Account removed.');
          return;
        }
      } catch (err) {
        console.error('IP record failed:', err);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: newUser.id,
            owner_name: ownerName.trim(),
            school_name: schoolName.trim(),
            whatsapp_number: waClean,
          },
          { onConflict: 'user_id' }
        );

      if (profileError) {
        setLoading(false);
        toast.error(profileError.message);
        return;
      }

      if (refCode?.trim()) {
        const { error: referralError } = await supabase.rpc('apply_referral_code', {
          p_referral_code: refCode.trim(),
          p_referred_user_id: newUser.id,
        });

        if (referralError) {
          console.error('Referral apply error:', referralError);
        }
      }
    }

    setLoading(false);
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEO
        title="Sign Up Free — Create Your School Result Portal"
        description="Create a free school account on ResultPortal.online and get 20 welcome credits. Publish exam results online in minutes — no credit card required."
        path="/signup"
      />
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-bold text-primary">OnlineResultPortal</Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Create your account</CardTitle>
            <CardDescription>Start publishing results in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner / Principal Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Muhammad Ahmad" className="pl-9" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolName">Institution / School Name</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="schoolName" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Greenfield Academy" className="pl-9" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number (with country code)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="whatsapp" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+923001234567" className="pl-9" required />
                </div>
                <p className="text-xs text-muted-foreground">Must start with country code, e.g. +92 for Pakistan</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.com" className="pl-9" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
