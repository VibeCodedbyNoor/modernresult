
ALTER TABLE public.schools ADD COLUMN template_changes_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.deduct_template_change_credits(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  change_count integer;
  current_balance integer;
BEGIN
  SELECT template_changes_count INTO change_count FROM schools WHERE id = p_school_id;
  
  IF change_count >= 3 THEN
    SELECT balance INTO current_balance FROM school_credits WHERE school_id = p_school_id FOR UPDATE;
    IF current_balance IS NULL OR current_balance < 5 THEN
      RETURN false;
    END IF;
    
    UPDATE school_credits SET balance = balance - 5, updated_at = now() WHERE school_id = p_school_id;
    INSERT INTO credit_transactions (school_id, amount, type, description)
    VALUES (p_school_id, -5, 'template_change', 'Result portal design change');
  END IF;
  
  UPDATE schools SET template_changes_count = template_changes_count + 1 WHERE id = p_school_id;
  RETURN true;
END;
$$;
