CREATE OR REPLACE FUNCTION public.add_credits_admin(p_school_id uuid, p_amount integer, p_description text DEFAULT 'Admin credit top-up'::text, p_paid_credits integer DEFAULT NULL)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_balance integer;
  v_commission_credits integer;
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

  -- Process referral commission only on paid credits (excluding bonus)
  v_commission_credits := COALESCE(p_paid_credits, p_amount);
  IF v_commission_credits > 0 THEN
    PERFORM public.process_referral_commission(p_school_id, v_commission_credits);
  END IF;

  RETURN new_balance;
END;
$function$;