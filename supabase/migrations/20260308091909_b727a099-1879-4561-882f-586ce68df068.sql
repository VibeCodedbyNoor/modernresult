
ALTER TABLE public.schools ADD COLUMN upload_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.deduct_upload_credits(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_upload_count integer;
  current_balance integer;
BEGIN
  SELECT upload_count INTO current_upload_count FROM schools WHERE id = p_school_id;
  
  IF current_upload_count >= 2 THEN
    SELECT balance INTO current_balance FROM school_credits WHERE school_id = p_school_id FOR UPDATE;
    IF current_balance IS NULL OR current_balance < 10 THEN
      RETURN false;
    END IF;
    
    UPDATE school_credits SET balance = balance - 10, updated_at = now() WHERE school_id = p_school_id;
    INSERT INTO credit_transactions (school_id, amount, type, description)
    VALUES (p_school_id, -10, 'excel_upload', 'Excel result upload');
  END IF;
  
  UPDATE schools SET upload_count = upload_count + 1 WHERE id = p_school_id;
  RETURN true;
END;
$$;
