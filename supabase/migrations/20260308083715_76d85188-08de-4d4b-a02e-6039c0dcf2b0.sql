
ALTER TABLE public.schools ADD COLUMN search_fields text[] NOT NULL DEFAULT ARRAY['roll_number', 'student_name'];

ALTER TABLE public.results ADD COLUMN father_name text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.fuzzy_search_results(p_exam_id uuid, p_class_name text, p_query text, p_roll_number text DEFAULT '', p_father_name text DEFAULT '')
 RETURNS SETOF results
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT *
  FROM public.results
  WHERE exam_id = p_exam_id
    AND class_name = p_class_name
    AND (
      -- Roll number match (if provided)
      (p_roll_number <> '' AND roll_number ILIKE p_roll_number)
      OR
      -- Student name match (if provided)
      (p_query <> '' AND (
        student_name ILIKE '%' || p_query || '%'
        OR similarity(student_name, p_query) > 0.25
      ))
      OR
      -- Father name match (if provided)
      (p_father_name <> '' AND (
        father_name ILIKE '%' || p_father_name || '%'
        OR similarity(father_name, p_father_name) > 0.25
      ))
      OR
      -- Fallback: if only roll_number search field but passed as p_query
      (p_roll_number = '' AND p_father_name = '' AND p_query <> '' AND (
        roll_number ILIKE p_query
        OR student_name ILIKE '%' || p_query || '%'
        OR similarity(student_name, p_query) > 0.25
      ))
    )
  ORDER BY 
    CASE WHEN p_query <> '' THEN similarity(student_name, p_query) ELSE 0 END DESC
  LIMIT 1;
$function$;
