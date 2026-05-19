import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Clock, Eye, Share2, Copy, Check } from "lucide-react";
import SEO from "@/components/SEO";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { fetchPostBySlug, fetchRelatedPosts, logPostView } from "@/lib/blogQueries";
import type { BlogPost } from "@/lib/blogTypes";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function extractToc(content: string) {
  const lines = content.split("\n");
  const toc: { level: number; text: string; id: string }[] = [];
  lines.forEach((line) => {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      const text = m[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      toc.push({ level: m[1].length, text, id });
    }
  });
  return toc;
}

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const p = await fetchPostBySlug(slug);
        setPost(p);
        if (p) {
          logPostView(p.id).catch(() => {});
          const r = await fetchRelatedPosts(p);
          setRelated(r);
        }
      } finally {
        setLoading(false);
      }
    })();
    window.scrollTo(0, 0);
  }, [slug]);

  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post]);
  const url = typeof window !== "undefined" ? window.location.href : `https://resultportal.online/blog/${slug}`;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50" style={{ background: "#0a0b14" }}>Loading...</div>;
  }
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0a0b14", color: "#fff" }}>
        <p className="text-white/70">Article not found.</p>
        <Link to="/blog" className="text-violet-300 hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  const shareTitle = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author_name },
    publisher: { "@type": "Organization", name: "ResultPortal", url: "https://resultportal.online" },
    image: post.cover_image_url,
    description: post.meta_description || post.excerpt,
    mainEntityOfPage: `https://resultportal.online/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0b14" }}>
      <SEO
        title={`${post.meta_title || post.title} | ResultPortal Blog`}
        description={post.meta_description || post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={jsonLd}
      />

      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ background: "rgba(10,11,20,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold" style={{ color: "#a78bfa" }}>OnlineResultPortal</Link>
          <div className="flex gap-3">
            <Link to="/blog"><Button variant="ghost" size="sm" className="text-violet-300">Blog</Button></Link>
            <Link to="/signup"><Button size="sm" style={{ background: "linear-gradient(90deg, #a78bfa, #6d28d9)", color: "#fff" }}>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Cover */}
      {post.cover_image_url && (
        <div className="w-full max-h-[480px] overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" style={{ maxHeight: 480 }} />
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <nav className="text-sm text-white/50 mb-6">
          <Link to="/" className="hover:text-white">Home</Link> <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-white">Blog</Link>
          {post.category && (
            <>
              {" "}<span className="mx-2">›</span>
              <Link to={`/blog/category/${post.category.slug}`} className="hover:text-white">{post.category.name}</Link>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-[1fr_260px] gap-10">
          <article className="max-w-[720px]">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: post.category.color }}>
                  {post.category.name}
                </span>
              )}
              {post.tags?.map((t) => (
                <span key={t.id} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/70">
                  #{t.name}
                </span>
              ))}
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                {post.author_avatar_url ? (
                  <img src={post.author_avatar_url} alt={post.author_name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-xs text-white font-semibold">
                    {post.author_name.charAt(0)}
                  </div>
                )}
                <span className="text-white/80">{post.author_name}</span>
              </div>
              <span>{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time_minutes} min read</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.view_count} views</span>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-xs text-white/50 flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share:</span>
              <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300">WhatsApp</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300">X</a>
              <button
                onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/20 text-white/80 flex items-center gap-1"
              >
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy link</>}
              </button>
            </div>

            {/* Body */}
            <div className="prose prose-invert max-w-none blog-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSlug]}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-pink-500/10 text-center">
              <h3 className="font-display text-2xl font-bold mb-2">Try ResultPortal Free</h3>
              <p className="text-white/70 mb-5">Publish your school results in 5 minutes.</p>
              <Link to="/signup">
                <Button size="lg" style={{ background: "linear-gradient(90deg, #a78bfa, #6d28d9)", color: "#fff" }}>
                  Get Started — 20 Free Credits
                </Button>
              </Link>
            </div>
          </article>

          {/* TOC sidebar */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h4 className="font-display text-sm uppercase tracking-wide text-white/50 mb-4">On this page</h4>
                <ul className="space-y-2 border-l border-white/10">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-4"}>
                      <a href={`#${h.id}`} className="text-sm text-white/60 hover:text-violet-300 block py-1">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold mb-6">Related articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          </section>
        )}
      </div>

      <footer className="py-8 text-center text-xs text-white/40 border-t border-white/5">
        &copy; {new Date().getFullYear()} OnlineResultPortal
      </footer>
    </div>
  );
}
