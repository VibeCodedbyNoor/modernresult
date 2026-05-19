export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface BlogTag {
  id: string;
  slug: string;
  name: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  og_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author_name: string;
  author_avatar_url: string | null;
  category_id: string | null;
  reading_time_minutes: number;
  view_count: number;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}
