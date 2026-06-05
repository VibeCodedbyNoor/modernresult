CREATE OR REPLACE FUNCTION public.fuzzy_search_results(p_exam_id uuid, p_class_name text, p_query text, p_roll_number text DEFAULT ''::text, p_father_name text DEFAULT ''::text)
 RETURNS SETOF results
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_school_id uuid;
  r public.results;
  found boolean := false;
BEGIN
  FOR r IN
    SELECT *
    FROM public.results
    WHERE exam_id = p_exam_id
      AND (p_class_name = '' OR class_name = p_class_name)
      AND (
        (p_roll_number <> '' AND roll_number ILIKE p_roll_number)
        OR (p_query <> '' AND (student_name ILIKE '%' || p_query || '%' OR similarity(student_name, p_query) > 0.25))
        OR (p_father_name <> '' AND (student_name ILIKE '%' || p_father_name || '%' OR similarity(COALESCE(father_name,''), p_father_name) > 0.25))
        OR (p_roll_number = '' AND p_father_name = '' AND p_query <> '' AND (
          roll_number ILIKE p_query
          OR student_name ILIKE '%' || p_query || '%'
          OR similarity(student_name, p_query) > 0.25
        ))
      )
    ORDER BY CASE WHEN p_query <> '' THEN similarity(student_name, p_query) ELSE 0 END DESC
    LIMIT 1
  LOOP
    found := true;
    RETURN NEXT r;
    SELECT school_id INTO v_school_id FROM public.exams WHERE id = p_exam_id;
    IF v_school_id IS NOT NULL THEN
      UPDATE public.schools SET result_check_count = result_check_count + 1 WHERE id = v_school_id;
    END IF;
  END LOOP;
  RETURN;
END;
$function$;