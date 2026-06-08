DROP FUNCTION IF EXISTS public.get_school_portal_data(text);

CREATE OR REPLACE FUNCTION public.get_school_portal_data(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  accent_color text,
  result_template text,
  search_fields text[],
  dmc_settings jsonb,
  plan text
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
    s.dmc_settings,
    s.plan::text
  FROM schools s
  WHERE s.slug = p_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_school_portal_data(text) TO anon, authenticated;
