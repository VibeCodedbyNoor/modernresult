
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can read roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin function to add credits
CREATE OR REPLACE FUNCTION public.add_credits_admin(p_school_id uuid, p_amount integer, p_description text DEFAULT 'Admin credit top-up')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
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

  RETURN new_balance;
END;
$$;

-- Admin select policy for schools table (admins can see all)
CREATE POLICY "Admins can view all schools"
ON public.schools
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin select policy for school_credits
CREATE POLICY "Admins can view all credits"
ON public.school_credits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin select policy for credit_transactions
CREATE POLICY "Admins can view all transactions"
ON public.credit_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin select policy for exams
CREATE POLICY "Admins can view all exams"
ON public.exams
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
