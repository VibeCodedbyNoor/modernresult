CREATE OR REPLACE FUNCTION public.get_my_referrals()
RETURNS TABLE (
  id uuid,
  referred_user_id uuid,
  created_at timestamptz,
  school_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    r.id,
    r.referred_user_id,
    r.created_at,
    COALESCE(p.school_name, '') AS school_name
  FROM public.referrals r
  LEFT JOIN public.profiles p ON p.user_id = r.referred_user_id
  WHERE r.referrer_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(
  p_referral_code text,
  p_referred_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_referred_user_id THEN
    RAISE EXCEPTION 'Unauthorized referral application';
  END IF;

  IF p_referral_code IS NULL OR btrim(p_referral_code) = '' THEN
    RETURN false;
  END IF;

  SELECT user_id
  INTO v_referrer_id
  FROM public.profiles
  WHERE upper(referral_code) = upper(btrim(p_referral_code))
  LIMIT 1;

  IF v_referrer_id IS NULL OR v_referrer_id = p_referred_user_id THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
  SET referred_by = v_referrer_id,
      updated_at = now()
  WHERE user_id = p_referred_user_id
    AND (referred_by IS NULL OR referred_by = v_referrer_id);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_user_id)
  VALUES (v_referrer_id, p_referred_user_id)
  ON CONFLICT (referred_user_id) DO UPDATE
  SET referrer_id = EXCLUDED.referrer_id;

  RETURN true;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_referral_code ON public.profiles;

CREATE TRIGGER set_profiles_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

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
  IF v_referrer_id IS NULL OR v_referrer_id = v_owner_id THEN RETURN; END IF;

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