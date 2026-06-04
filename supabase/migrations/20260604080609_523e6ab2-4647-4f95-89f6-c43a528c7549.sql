
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS exam_settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS dmc_settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS result_check_count integer NOT NULL DEFAULT 0;

-- Wrap fuzzy_search_results: rename underlying and add a counter wrapper.
CREATE OR REPLACE FUNCTION public.fuzzy_search_results(p_exam_id uuid, p_class_name text, p_query text, p_roll_number text DEFAULT ''::text, p_father_name text DEFAULT ''::text)
RETURNS SETOF public.results
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_school_id uuid;
  r public.results;
  found boolean := false;
BEGIN
  FOR r IN
    SELECT *
    FROM public.results
    WHERE exam_id = p_exam_id
      AND class_name = p_class_name
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
$$;

-- Recalculate positions: writes rank into subjects jsonb under "Position"
CREATE OR REPLACE FUNCTION public.recalc_exam_positions(p_exam_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec record;
  prev_pct numeric := NULL;
  prev_rank int := 0;
  idx int := 0;
BEGIN
  FOR rec IN
    SELECT r.id, r.class_name, r.subjects,
      (
        SELECT CASE WHEN SUM((value->>'total')::numeric) > 0
          THEN SUM((value->>'obtained')::numeric) / SUM((value->>'total')::numeric) * 100
          ELSE 0 END
        FROM jsonb_each(r.subjects)
        WHERE key <> 'Position' AND jsonb_typeof(value)='object'
      ) AS pct
    FROM public.results r
    WHERE r.exam_id = p_exam_id
    ORDER BY r.class_name, pct DESC NULLS LAST
  LOOP
    IF prev_pct IS DISTINCT FROM rec.pct THEN
      prev_rank := idx + 1;
    END IF;
    idx := idx + 1;
    UPDATE public.results
      SET subjects = jsonb_set(COALESCE(subjects,'{}'::jsonb), '{Position}', to_jsonb(prev_rank))
      WHERE id = rec.id;
    prev_pct := rec.pct;
  END LOOP;
END;
$$;
