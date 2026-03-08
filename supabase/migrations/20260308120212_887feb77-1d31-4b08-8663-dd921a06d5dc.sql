
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
    COALESCE(p.school_name, '') as school_name
  FROM referrals r
  LEFT JOIN profiles p ON p.user_id = r.referred_user_id
  WHERE r.referrer_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;
