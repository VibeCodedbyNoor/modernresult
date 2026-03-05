CREATE OR REPLACE FUNCTION public.fuzzy_search_results(
  p_exam_id uuid,
  p_class_name text,
  p_query text
)
RETURNS SETOF public.results
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT *
  FROM public.results
  WHERE exam_id = p_exam_id
    AND class_name = p_class_name
    AND (
      roll_number ILIKE p_query
      OR student_name ILIKE '%' || p_query || '%'
      OR similarity(student_name, p_query) > 0.25
    )
  ORDER BY similarity(student_name, p_query) DESC
  LIMIT 1;
$$;