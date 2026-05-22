CREATE TABLE public.signup_ips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_signup_ips_ip ON public.signup_ips(ip_address);

ALTER TABLE public.signup_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view signup ips"
ON public.signup_ips
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.check_ip_signup_limit(p_ip text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 3 FROM public.signup_ips WHERE ip_address = p_ip;
$$;

CREATE OR REPLACE FUNCTION public.record_signup_ip(p_user_id uuid, p_ip text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.signup_ips (user_id, ip_address) VALUES (p_user_id, p_ip);
$$;