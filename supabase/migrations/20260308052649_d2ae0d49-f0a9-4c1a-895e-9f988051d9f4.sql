ALTER TABLE public.exams ADD COLUMN display_at timestamptz DEFAULT NULL;
ALTER TABLE public.exams ADD COLUMN is_stopped boolean NOT NULL DEFAULT false;