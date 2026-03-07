CREATE OR REPLACE FUNCTION public.deduct_credits_bulk(p_school_id uuid, p_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cost integer;
  current_balance integer;
BEGIN
  IF p_count > 400 THEN
    cost := ceil(p_count * 0.8);
  ELSE
    cost := p_count;
  END IF;

  SELECT balance INTO current_balance
  FROM public.school_credits
  WHERE school_id = p_school_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < cost THEN
    RETURN 0;
  END IF;

  UPDATE public.school_credits
  SET balance = balance - cost, updated_at = now()
  WHERE school_id = p_school_id;

  INSERT INTO public.credit_transactions (school_id, amount, type, description)
  VALUES (p_school_id, -cost, 'bulk_marksheet',
    'Bulk marksheet download — ' || p_count || ' students');

  RETURN cost;
END;
$$;