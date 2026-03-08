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
  v_total_earned numeric(10,2);
  v_cap numeric(10,2) := 2000.00;
  v_remaining numeric(10,2);
BEGIN
  -- Get school owner
  SELECT owner_id INTO v_owner_id FROM schools WHERE id = p_school_id;
  IF v_owner_id IS NULL THEN RETURN; END IF;

  -- Check if owner was referred
  SELECT referred_by INTO v_referrer_id FROM profiles WHERE user_id = v_owner_id;
  IF v_referrer_id IS NULL OR v_referrer_id = v_owner_id THEN RETURN; END IF;

  -- Get referral record
  SELECT id INTO v_referral_id FROM referrals WHERE referred_user_id = v_owner_id AND referrer_id = v_referrer_id;
  IF v_referral_id IS NULL THEN RETURN; END IF;

  -- Check total earned so far by this referrer
  SELECT COALESCE(SUM(commission_rupees), 0) INTO v_total_earned
  FROM referral_earnings WHERE referrer_id = v_referrer_id;

  -- If already at or above cap, do nothing
  IF v_total_earned >= v_cap THEN RETURN; END IF;

  -- Calculate 10% commission in PKR (1 credit = PKR 9, so 10% = credits * 0.9)
  v_commission_rupees := p_credits_added * 0.9;

  -- Cap the commission to not exceed the limit
  v_remaining := v_cap - v_total_earned;
  IF v_commission_rupees > v_remaining THEN
    v_commission_rupees := v_remaining;
  END IF;

  -- Log commission with PKR amount
  INSERT INTO referral_earnings (referrer_id, referral_id, credits_purchased, commission_credits, commission_rupees)
  VALUES (v_referrer_id, v_referral_id, p_credits_added, GREATEST(1, floor(p_credits_added * 0.10)), v_commission_rupees);
END;
$function$;