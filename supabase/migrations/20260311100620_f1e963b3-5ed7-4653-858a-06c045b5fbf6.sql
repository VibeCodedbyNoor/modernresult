
-- Fix exams: drop restrictive public SELECT policies and recreate as permissive
DROP POLICY IF EXISTS "Public can view published exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can view all exams" ON public.exams;

CREATE POLICY "Public can view published exams"
ON public.exams FOR SELECT TO public
USING (is_published = true);

CREATE POLICY "Admins can view all exams"
ON public.exams FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix results: drop restrictive public SELECT policy and recreate as permissive
DROP POLICY IF EXISTS "Public can view results of published exams" ON public.results;

CREATE POLICY "Public can view results of published exams"
ON public.results FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM exams WHERE exams.id = results.exam_id AND exams.is_published = true
));
