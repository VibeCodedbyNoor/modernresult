import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/SEO";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { fetchCategoryBySlug, fetchPublishedPosts } from "@/lib/blogQueries";
import type { BlogCategory as Cat, BlogPost } from "@/lib/blogTypes";

export default function BlogCategoryPage() {
  const { slug = "" } = useParams();
  const [category, setCategory] = useState<Cat | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cat, list] = await Promise.all([
          fetchCategoryBySlug(slug),
          fetchPublishedPosts({ categorySlug: slug }),
        ]);
        setCategory(cat);
        setPosts(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const title = category?.meta_title || `${category?.name || "Category"} | ResultPortal Blog`;
  const desc = category?.meta_description || category?.description || "Browse articles in this category.";

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0b14" }}>
      <SEO title={title} description={desc} path={`/blog/category/${slug}`} />

      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(10,11,20,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold" style={{ color: "#a78bfa" }}>OnlineResultPortal</Link>
          <div className="flex gap-3">
            <Link to="/blog"><Button variant="ghost" size="sm" className="text-violet-300">Blog</Button></Link>
            <Link to="/signup"><Button size="sm" style={{ background: "linear-gradient(90deg, #a78bfa, #6d28d9)", color: "#fff" }}>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <header className="container mx-auto px-4 pt-16 pb-10">
        <nav className="text-sm text-white/50 mb-4">
          <Link to="/" className="hover:text-white">Home</Link> <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-white">Blog</Link> <span className="mx-2">›</span>
          <span className="text-white/80">{category?.name || slug}</span>
        </nav>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: category?.color || "#a78bfa" }}>
          {category?.name || "Category"}
        </h1>
        {category?.description && <p className="text-white/60 max-w-2xl">{category.description}</p>}
      </header>

      <main className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20 text-white/50">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-white/50">No posts in this category yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
