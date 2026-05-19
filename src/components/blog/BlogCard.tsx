import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blogTypes";

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all ${featured ? "md:grid md:grid-cols-2 md:gap-0" : ""}`}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[16/10]"} bg-white/5`}>
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-4xl font-display">📚</div>
        )}
        {post.category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        )}
      </div>
      <div className={`p-5 ${featured ? "md:p-8 md:flex md:flex-col md:justify-center" : ""}`}>
        <h3 className={`font-display font-bold text-white group-hover:text-violet-300 transition-colors ${featured ? "text-2xl md:text-3xl mb-3" : "text-lg mb-2 line-clamp-2"}`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className={`text-sm text-white/60 mb-4 ${featured ? "line-clamp-3 md:text-base" : "line-clamp-2"}`}>
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-white/50">
          {post.author_avatar_url ? (
            <img src={post.author_avatar_url} alt={post.author_name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-violet-500/30 flex items-center justify-center text-[10px] text-white font-semibold">
              {post.author_name.charAt(0)}
            </div>
          )}
          <span>{post.author_name}</span>
          <span>•</span>
          <span>{formatDate(post.published_at)}</span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.reading_time_minutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
