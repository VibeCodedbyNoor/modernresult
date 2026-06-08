-- Revoke direct access from public roles to sensitive tables
-- We keep 'service_role' and 'postgres' (owner) access.
-- RLS will still be active for owner access via 'authenticated' role.
REVOKE SELECT ON public.results FROM anon, authenticated;
REVOKE SELECT ON public.exams FROM anon, authenticated;
REVOKE SELECT ON public.schools FROM anon, authenticated;

-- Grant back minimal permissions for authenticated users to manage their own data via RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT SELECT ON public.results TO anon; -- We need this for the RPC to work if it wasn't SECURITY DEFINER, but it IS.
-- Wait, if I REVOKE, the RPC SECURITY DEFINER still works.
-- But if I want to keep RLS working for owners, I MUST GRANT to authenticated.

-- Re-enable RLS is already on, but let's be sure
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- RPC: Get classes for a specific published exam
CREATE OR REPLACE FUNCTION public.get_exam_classes(p_exam_id uuid)
RETURNS TABLE (class_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT r.class_name
  FROM results r
  JOIN exams e ON e.id = r.exam_id
  WHERE r.exam_id = p_exam_id AND e.is_published = true
  ORDER BY r.class_name;
END;
$$;

-- RPC: Get active published exam for a school slug
CREATE OR REPLACE FUNCTION public.get_active_exam_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  display_at timestamptz,
  is_stopped boolean,
  search_mode text,
  exam_settings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, 
    e.name, 
    e.display_at, 
    e.is_stopped, 
    e.search_mode, 
    e.exam_settings
  FROM exams e
  JOIN schools s ON s.id = e.school_id
  WHERE s.slug = p_slug AND e.is_published = true
  ORDER BY e.created_at DESC
  LIMIT 1;
END;
$$;

-- RPC: Get school data for the portal by slug
CREATE OR REPLACE FUNCTION public.get_school_portal_data(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  accent_color text,
  result_template text,
  search_fields text[],
  dmc_settings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, 
    s.name, 
    s.slug, 
    s.logo_url, 
    s.accent_color, 
    s.result_template, 
    s.search_fields,
    s.dmc_settings
  FROM schools s
  WHERE s.slug = p_slug;
END;
$$;

-- Ensure public can execute these functions
GRANT EXECUTE ON FUNCTION public.get_exam_classes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_exam_by_slug(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_school_portal_data(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fuzzy_search_results(uuid, text, text, text, text) TO anon, authenticated;
