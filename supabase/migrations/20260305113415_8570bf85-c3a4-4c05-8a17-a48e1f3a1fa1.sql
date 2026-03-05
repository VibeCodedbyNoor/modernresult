-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  accent_color TEXT NOT NULL DEFAULT '#6C3CE0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their school" ON public.schools
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public can view schools by slug" ON public.schools
  FOR SELECT USING (true);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School owners can manage exams" ON public.exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.schools WHERE id = school_id AND owner_id = auth.uid())
  );

CREATE POLICY "Public can view published exams" ON public.exams
  FOR SELECT USING (is_published = true);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  subjects JSONB NOT NULL DEFAULT '{}',
  total_marks INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School owners can manage results" ON public.results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.exams e 
      JOIN public.schools s ON s.id = e.school_id 
      WHERE e.id = exam_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view results of published exams" ON public.results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.exams WHERE id = exam_id AND is_published = true)
  );

-- Create indexes
CREATE INDEX idx_schools_slug ON public.schools(slug);
CREATE INDEX idx_results_roll_number ON public.results(roll_number);
CREATE INDEX idx_results_exam_id ON public.results(exam_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();