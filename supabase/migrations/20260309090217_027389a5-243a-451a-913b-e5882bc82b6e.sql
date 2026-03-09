CREATE OR REPLACE FUNCTION public.admin_delete_school(p_school_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_owner_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  SELECT owner_id INTO v_owner_id FROM schools WHERE id = p_school_id;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'School not found';
  END IF;

  IF public.has_role(v_owner_id, 'admin') THEN
    RAISE EXCEPTION 'Cannot delete a school owned by an admin user';
  END IF;

  DELETE FROM results WHERE exam_id IN (SELECT id FROM exams WHERE school_id = p_school_id);
  DELETE FROM exams WHERE school_id = p_school_id;
  DELETE FROM credit_transactions WHERE school_id = p_school_id;
  DELETE FROM school_credits WHERE school_id = p_school_id;
  DELETE FROM referral_earnings WHERE referrer_id = v_owner_id;
  DELETE FROM referral_earnings WHERE referral_id IN (SELECT id FROM referrals WHERE referred_user_id = v_owner_id);
  DELETE FROM referrals WHERE referrer_id = v_owner_id OR referred_user_id = v_owner_id;
  DELETE FROM withdrawal_requests WHERE user_id = v_owner_id;
  DELETE FROM schools WHERE id = p_school_id;
  DELETE FROM profiles WHERE user_id = v_owner_id;
  DELETE FROM user_roles WHERE user_id = v_owner_id;
END;
$function$;