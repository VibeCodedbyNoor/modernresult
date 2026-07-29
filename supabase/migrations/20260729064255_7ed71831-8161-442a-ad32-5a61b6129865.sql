CREATE OR REPLACE FUNCTION public.get_published_exams_by_slug(p_slug text)
RETURNS TABLE(id uuid, name text, display_at timestamp with time zone, is_stopped boolean, search_mode text, exam_settings jsonb, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT e.id, e.name, e.display_at, e.is_stopped, e.search_mode, e.exam_settings, e.created_at
  FROM exams e
  JOIN schools s ON s.id = e.school_id
  WHERE s.slug = p_slug AND e.is_published = true
  ORDER BY e.created_at DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_published_exams_by_slug(text) TO anon, authenticated;