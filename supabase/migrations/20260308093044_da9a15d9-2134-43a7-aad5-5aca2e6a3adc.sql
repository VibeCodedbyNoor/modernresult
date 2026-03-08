
-- Fix exams RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Public can view published exams" ON public.exams;
DROP POLICY IF EXISTS "School owners can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can view all exams" ON public.exams;

CREATE POLICY "Public can view published exams"
  ON public.exams FOR SELECT
  USING (is_published = true);

CREATE POLICY "School owners can manage exams"
  ON public.exams FOR ALL
  USING (EXISTS (SELECT 1 FROM schools WHERE schools.id = exams.school_id AND schools.owner_id = auth.uid()));

CREATE POLICY "Admins can view all exams"
  ON public.exams FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix results RLS: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Public can view results of published exams" ON public.results;
DROP POLICY IF EXISTS "School owners can manage results" ON public.results;

CREATE POLICY "Public can view results of published exams"
  ON public.results FOR SELECT
  USING (EXISTS (SELECT 1 FROM exams WHERE exams.id = results.exam_id AND exams.is_published = true));

CREATE POLICY "School owners can manage results"
  ON public.results FOR ALL
  USING (EXISTS (SELECT 1 FROM exams e JOIN schools s ON s.id = e.school_id WHERE e.id = results.exam_id AND s.owner_id = auth.uid()));
