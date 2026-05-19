import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import { fetchCategories, fetchPublishedPosts, fetchTags } from "@/lib/blogQueries";
import type { BlogCategory, BlogPost, BlogTag } from "@/lib/blogTypes";

const PAGE_SIZE = 9;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c, t] = await Promise.all([fetchPublishedPosts(), fetchCategories(), fetchTags()]);
        setPosts(p);
        setCategories(c);
        setTags(t);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = posts;
    if (activeCat !== "all") list = list.filter((p) => p.category?.slug === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
    }
    return list;
  }, [posts, activeCat, search]);

  const featured = filtered.find((p) => p.is_featured) || filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);
  const visible = rest.slice(0, page * PAGE_SIZE);
  const popular = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach((p) => {
      if (p.category) map[p.category.slug] = (map[p.category.slug] || 0) + 1;
    });
    return map;
  }, [posts]);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0b14" }}>
      <SEO
        title="School Result Management Blog | ResultPortal"
        description="Tips, guides and insights for school owners on publishing results online. Learn how to manage exams, student data and school administration."
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "ResultPortal Blog",
          url: "https://resultportal.online/blog",
          description: "Guides, tips, and insights for school owners and educators.",
        }}
      />

      {/* Header nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(10,11,20,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold" style={{ color: "#a78bfa" }}>
            OnlineResultPortal
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/blog"><Button variant="ghost" size="sm" className="text-violet-300">Blog</Button></Link>
            <Link to="/login"><Button variant="ghost" size="sm" className="text-gray-300">Login</Button></Link>
            <Link to="/signup">
              <Button size="sm" style={{ background: "linear-gradient(90deg, #a78bfa, #6d28d9)", color: "#fff" }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="container mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
          ResultPortal Blog
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
          Guides, tips, and insights for school owners and educators.
        </p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </header>

      {/* Category tabs */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCat === "all" ? "bg-violet-500 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCat === c.slug ? "text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
              style={activeCat === c.slug ? { backgroundColor: c.color } : {}}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20 text-white/50">Loading articles...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            No articles yet. Check back soon!
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-10">
            <div>
              {featured && (
                <div className="mb-10">
                  <BlogCard post={featured} featured />
                </div>
              )}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
              {visible.length < rest.length && (
                <div className="text-center mt-10">
                  <Button onClick={() => setPage(page + 1)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Load more
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {popular.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-4">Popular Posts</h3>
                  <ul className="space-y-3">
                    {popular.map((p, i) => (
                      <li key={p.id}>
                        <Link to={`/blog/${p.slug}`} className="flex gap-3 group">
                          <span className="text-2xl font-display font-bold text-white/20 group-hover:text-violet-300 w-8">
                            0{i + 1}
                          </span>
                          <span className="text-sm text-white/80 group-hover:text-violet-300 line-clamp-2">{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link to={`/blog/category/${c.slug}`} className="flex items-center justify-between text-sm text-white/70 hover:text-white">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                        <span className="text-white/40">{categoryCounts[c.slug] || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {tags.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t.id} className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/70 border border-white/10">
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-xs text-white/40 border-t border-white/5">
        &copy; {new Date().getFullYear()} OnlineResultPortal ·{" "}
        <Link to="/" className="hover:text-white/70">Home</Link> ·{" "}
        <Link to="/help" className="hover:text-white/70">Help</Link>
      </footer>
    </div>
  );
}
