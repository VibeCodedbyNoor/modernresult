
-- Create school_credits table
CREATE TABLE public.school_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_credits ENABLE ROW LEVEL SECURITY;

-- Owners can view their own credits
CREATE POLICY "Owners can view their credits"
ON public.school_credits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schools
    WHERE schools.id = school_credits.school_id
    AND schools.owner_id = auth.uid()
  )
);

-- Create credit_transactions table
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Owners can view their own transactions
CREATE POLICY "Owners can view their transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.schools
    WHERE schools.id = credit_transactions.school_id
    AND schools.owner_id = auth.uid()
  )
);

-- Allow anon and authenticated to call deduct_credit
CREATE OR REPLACE FUNCTION public.deduct_credit(p_school_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT balance INTO current_balance
  FROM public.school_credits
  WHERE school_id = p_school_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.school_credits
  SET balance = balance - 1, updated_at = now()
  WHERE school_id = p_school_id;

  INSERT INTO public.credit_transactions (school_id, amount, type, description)
  VALUES (p_school_id, -1, 'result_check', 'Student result view');

  RETURN true;
END;
$$;

-- Trigger: auto-create credits row when school is created
CREATE OR REPLACE FUNCTION public.handle_new_school_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.school_credits (school_id, balance)
  VALUES (NEW.id, 20);

  INSERT INTO public.credit_transactions (school_id, amount, type, description)
  VALUES (NEW.id, 20, 'signup_bonus', 'Welcome bonus — 20 free credits');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_school_created_add_credits
AFTER INSERT ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_school_credits();

-- Updated at trigger for school_credits
CREATE TRIGGER update_school_credits_updated_at
BEFORE UPDATE ON public.school_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
