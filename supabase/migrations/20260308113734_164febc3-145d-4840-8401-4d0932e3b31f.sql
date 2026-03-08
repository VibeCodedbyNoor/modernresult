-- Add commission_rupees column to referral_earnings
ALTER TABLE public.referral_earnings 
ADD COLUMN IF NOT EXISTS commission_rupees numeric(10,2) DEFAULT 0;

-- Update existing records to have rupee values (credits * 9 * 0.10 = credits * 0.9)
UPDATE public.referral_earnings 
SET commission_rupees = credits_purchased * 0.9
WHERE commission_rupees = 0 OR commission_rupees IS NULL;

-- Update the process_referral_commission function to calculate PKR
CREATE OR REPLACE FUNCTION public.process_referral_commission(p_school_id uuid, p_credits_added integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_owner_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
  v_commission_rupees numeric(10,2);
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

  -- Calculate 10% commission in PKR (1 credit = PKR 9, so 10% = credits * 0.9)
  v_commission_rupees := p_credits_added * 0.9;

  -- Log commission with PKR amount
  INSERT INTO referral_earnings (referrer_id, referral_id, credits_purchased, commission_credits, commission_rupees)
  VALUES (v_referrer_id, v_referral_id, p_credits_added, GREATEST(1, floor(p_credits_added * 0.10)), v_commission_rupees);
END;
$function$;