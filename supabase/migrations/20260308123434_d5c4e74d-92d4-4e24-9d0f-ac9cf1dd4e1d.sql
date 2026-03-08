CREATE OR REPLACE FUNCTION public.admin_delete_school(p_school_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_owner_id uuid;
BEGIN
  -- Only admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  -- Get owner
  SELECT owner_id INTO v_owner_id FROM schools WHERE id = p_school_id;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'School not found';
  END IF;

  -- Delete results (via exams)
  DELETE FROM results WHERE exam_id IN (SELECT id FROM exams WHERE school_id = p_school_id);
  
  -- Delete exams
  DELETE FROM exams WHERE school_id = p_school_id;
  
  -- Delete credit transactions
  DELETE FROM credit_transactions WHERE school_id = p_school_id;
  
  -- Delete school credits
  DELETE FROM school_credits WHERE school_id = p_school_id;
  
  -- Delete referral earnings where referrer is this owner
  DELETE FROM referral_earnings WHERE referrer_id = v_owner_id;
  
  -- Delete referral earnings where referred user purchased (via referral_id linking to referrals of this user)
  DELETE FROM referral_earnings WHERE referral_id IN (SELECT id FROM referrals WHERE referred_user_id = v_owner_id);
  
  -- Delete referrals involving this user
  DELETE FROM referrals WHERE referrer_id = v_owner_id OR referred_user_id = v_owner_id;
  
  -- Delete withdrawal requests
  DELETE FROM withdrawal_requests WHERE user_id = v_owner_id;
  
  -- Delete the school
  DELETE FROM schools WHERE id = p_school_id;
  
  -- Delete profile
  DELETE FROM profiles WHERE user_id = v_owner_id;
  
  -- Delete user role
  DELETE FROM user_roles WHERE user_id = v_owner_id;
END;
$function$;