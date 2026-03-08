
-- Site settings table for global toggles
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default earn_with_us setting (off by default)
INSERT INTO public.site_settings (key, value) VALUES ('earn_with_us', '{"enabled": false}'::jsonb);

-- Add referral_code and referred_by to profiles
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by uuid;

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_user_id);

-- Referral earnings table
CREATE TABLE public.referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referral_id uuid REFERENCES public.referrals(id),
  credits_purchased integer NOT NULL,
  commission_credits integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings" ON public.referral_earnings FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Admins can view all earnings" ON public.referral_earnings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  payment_method text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all withdrawals" ON public.withdrawal_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Generate referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
BEGIN
  IF NEW.referral_code IS NULL THEN
    new_code := upper(substr(md5(random()::text), 1, 8));
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code) LOOP
      new_code := upper(substr(md5(random()::text), 1, 8));
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Generate referral codes for existing profiles
UPDATE public.profiles SET referral_code = upper(substr(md5(random()::text || id::text), 1, 8)) WHERE referral_code IS NULL;

-- Function to process referral commission when admin adds credits
CREATE OR REPLACE FUNCTION public.process_referral_commission(p_school_id uuid, p_credits_added integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_owner_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
  v_commission integer;
BEGIN
  -- Get school owner
  SELECT owner_id INTO v_owner_id FROM schools WHERE id = p_school_id;
  IF v_owner_id IS NULL THEN RETURN; END IF;

  -- Check if owner was referred
  SELECT referred_by INTO v_referrer_id FROM profiles WHERE user_id = v_owner_id;
  IF v_referrer_id IS NULL THEN RETURN; END IF;

  -- Get referral record
  SELECT id INTO v_referral_id FROM referrals WHERE referred_user_id = v_owner_id AND referrer_id = v_referrer_id;
  IF v_referral_id IS NULL THEN RETURN; END IF;

  -- Calculate 10% commission
  v_commission := GREATEST(1, floor(p_credits_added * 0.10));

  -- Log commission
  INSERT INTO referral_earnings (referrer_id, referral_id, credits_purchased, commission_credits)
  VALUES (v_referrer_id, v_referral_id, p_credits_added, v_commission);
END;
$$;

-- Update add_credits_admin to also trigger referral commission
CREATE OR REPLACE FUNCTION public.add_credits_admin(p_school_id uuid, p_amount integer, p_description text DEFAULT 'Admin credit top-up'::text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.school_credits
  SET balance = balance + p_amount, updated_at = now()
  WHERE school_id = p_school_id
  RETURNING balance INTO new_balance;

  INSERT INTO public.credit_transactions (school_id, amount, type, description)
  VALUES (p_school_id, p_amount, 'admin_topup', p_description);

  -- Process referral commission
  PERFORM public.process_referral_commission(p_school_id, p_amount);

  RETURN new_balance;
END;
$$;
