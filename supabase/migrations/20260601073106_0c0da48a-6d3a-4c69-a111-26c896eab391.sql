-- Add plan to schools
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_plan_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_plan_check CHECK (plan IN ('free','pro'));

-- Add search_mode and password to exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS search_mode text NOT NULL DEFAULT 'roll_number';
ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_search_mode_check;
ALTER TABLE public.exams ADD CONSTRAINT exams_search_mode_check CHECK (search_mode IN ('roll_number','name','both'));
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS password text;

-- column_mappings table
CREATE TABLE IF NOT EXISTS public.column_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  mapping_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.column_mappings TO authenticated;
GRANT ALL ON public.column_mappings TO service_role;

ALTER TABLE public.column_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their column mappings"
ON public.column_mappings FOR ALL
USING (EXISTS (SELECT 1 FROM public.schools s WHERE s.id = column_mappings.school_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.schools s WHERE s.id = column_mappings.school_id AND s.owner_id = auth.uid()));

CREATE POLICY "Admins can view column mappings"
ON public.column_mappings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- exam_subjects table
CREATE TABLE IF NOT EXISTS public.exam_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  subject_name text NOT NULL,
  total_marks integer NOT NULL DEFAULT 100,
  pass_marks integer NOT NULL DEFAULT 33,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exam_subjects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_subjects TO authenticated;
GRANT ALL ON public.exam_subjects TO service_role;

ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view subjects of published exams"
ON public.exam_subjects FOR SELECT
USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_subjects.exam_id AND e.is_published = true));

CREATE POLICY "Owners manage exam subjects"
ON public.exam_subjects FOR ALL
USING (EXISTS (SELECT 1 FROM public.exams e JOIN public.schools s ON s.id = e.school_id WHERE e.id = exam_subjects.exam_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.exams e JOIN public.schools s ON s.id = e.school_id WHERE e.id = exam_subjects.exam_id AND s.owner_id = auth.uid()));

CREATE POLICY "Admins can view exam subjects"
ON public.exam_subjects FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- admin plan toggle RPC
CREATE OR REPLACE FUNCTION public.set_school_plan(p_school_id uuid, p_plan text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;
  IF p_plan NOT IN ('free','pro') THEN
    RAISE EXCEPTION 'Invalid plan';
  END IF;
  UPDATE public.schools SET plan = p_plan, updated_at = now() WHERE id = p_school_id;
END;
$$;