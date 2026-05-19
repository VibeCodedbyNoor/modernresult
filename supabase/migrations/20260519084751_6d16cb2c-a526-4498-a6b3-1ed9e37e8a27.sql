
-- Blog categories
CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  color text NOT NULL DEFAULT '#6C3CE0',
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog tags
CREATE TABLE public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blog posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  og_image_url text,
  meta_title text,
  meta_description text,
  author_name text NOT NULL DEFAULT 'ResultPortal Team',
  author_avatar_url text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  reading_time_minutes integer NOT NULL DEFAULT 5,
  view_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);

-- Junction
CREATE TABLE public.blog_post_tags (
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Views log
CREATE TABLE public.blog_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_views_post ON public.blog_views(post_id);

-- Auto-increment view_count on blog_views insert
CREATE OR REPLACE FUNCTION public.increment_blog_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_views_increment
AFTER INSERT ON public.blog_views
FOR EACH ROW EXECUTE FUNCTION public.increment_blog_view_count();

CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "Anyone can read post tags" ON public.blog_post_tags FOR SELECT USING (true);

-- Admins can manage all
CREATE POLICY "Admins manage categories" ON public.blog_categories FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tags" ON public.blog_tags FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage post tags" ON public.blog_post_tags FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view all views" ON public.blog_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Anyone (incl. anon) can insert a view record
CREATE POLICY "Anyone can log a view" ON public.blog_views FOR INSERT WITH CHECK (true);

-- Seed default categories
INSERT INTO public.blog_categories (slug, name, color, description) VALUES
  ('school-management', 'School Management', '#6C3CE0', 'Running your school efficiently'),
  ('online-results', 'Online Results', '#0EA5E9', 'Publishing and managing results'),
  ('pakistan-education', 'Pakistan Education', '#16A34A', 'News and updates from Pakistan'),
  ('how-to-guides', 'How-To Guides', '#F59E0B', 'Step-by-step tutorials'),
  ('edtech-tools', 'EdTech Tools', '#EF4444', 'Tools and tech for educators');
