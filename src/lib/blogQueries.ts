import { supabase } from "@/integrations/supabase/client";
import type { BlogPost, BlogCategory, BlogTag } from "./blogTypes";

const POST_SELECT = `
  id, slug, title, excerpt, content, cover_image_url, og_image_url,
  meta_title, meta_description, author_name, author_avatar_url,
  category_id, reading_time_minutes, view_count, status, is_featured,
  published_at, created_at, updated_at,
  category:blog_categories(id, slug, name, description, color, meta_title, meta_description),
  tags:blog_post_tags(tag:blog_tags(id, slug, name))
`;

function normalize(row: any): BlogPost {
  return {
    ...row,
    tags: (row.tags || []).map((t: any) => t.tag).filter(Boolean),
  };
}

export async function fetchPublishedPosts(opts?: { categorySlug?: string; limit?: number }) {
  let q = supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  let posts = (data || []).map(normalize);
  if (opts?.categorySlug) {
    posts = posts.filter((p) => p.category?.slug === opts.categorySlug);
  }
  return posts;
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}

export async function fetchCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase.from("blog_categories").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function fetchCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const { data, error } = await supabase.from("blog_categories").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase.from("blog_tags").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function logPostView(postId: string) {
  await supabase.from("blog_views").insert({ post_id: postId });
}

export async function fetchRelatedPosts(post: BlogPost, limit = 3) {
  if (!post.category_id) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .eq("category_id", post.category_id)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data || []).map(normalize);
}
