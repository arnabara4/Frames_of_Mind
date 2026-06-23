import { ViewTransition } from "react";
import Link from "next/link";
import type { Blog } from "@/lib/types";
import { formatDate } from "@/lib/types";
import Thumb from "@/components/Thumb";

function Meta({ blog }: { blog: Blog }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral ring-1 ring-coral/15">
        {formatDate(blog.created_at)}
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-bark/55">
        🍂 {blog.read_time ?? "2 min read"}
      </span>
      {typeof blog.comment_count === "number" && (
        <span className="inline-flex items-center gap-1 text-xs text-bark/55">
          💬 {blog.comment_count}
        </span>
      )}
    </div>
  );
}

/** Vertical card used in the /blogs grid. */
export function BlogCard({ blog, seed = 0 }: { blog: Blog; seed?: number }) {
  return (
    <Link
      href={`/blogs/${blog.id}`}
      transitionTypes={["nav-forward"]}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-maple/15 bg-gradient-to-br from-white via-cream/50 to-peach/30 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-coral/30 hover:shadow-[var(--shadow-warm)] active:scale-[0.98] active:brightness-95 active:shadow-sm"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-3 text-5xl opacity-0 transition-all duration-500 group-hover:rotate-12 group-hover:opacity-30"
      >
        🍁
      </span>
      {/* ViewTransition name matches the detail hero — browser morphs between them */}
      <ViewTransition name={`blog-${blog.id}`} share="morph">
        <Thumb src={blog.cover_image} alt={blog.title} seed={seed} framed className="h-56 w-full" />
      </ViewTransition>
      <div className="mt-4">
        <Meta blog={blog} />
      </div>
      <h3 className="mt-2 font-display text-2xl font-bold text-ink transition-colors group-hover:text-coral">
        {blog.title}
      </h3>
      {blog.excerpt && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-bark/70">
          {blog.excerpt}
        </p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-coral opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
        Read more 🍃
      </span>
    </Link>
  );
}

/** Horizontal row used in the home "Recent Blogs" list. */
export function BlogRow({ blog, seed = 0 }: { blog: Blog; seed?: number }) {
  return (
    <Link
      href={`/blogs/${blog.id}`}
      transitionTypes={["nav-forward"]}
      className="group relative grid grid-cols-[130px_1fr] items-center gap-5 overflow-hidden rounded-3xl border border-maple/15 bg-gradient-to-br from-white via-cream/45 to-peach/25 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-coral/30 hover:shadow-[var(--shadow-warm)] active:scale-[0.98] active:brightness-95 md:grid-cols-[280px_1fr] md:gap-8 md:p-5"
    >
      {/* coral accent rail */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-coral to-maple transition-transform duration-300 group-hover:scale-y-100"
      />
      <ViewTransition name={`blog-${blog.id}`} share="morph">
        <Thumb src={blog.cover_image} alt={blog.title} seed={seed} framed className="h-28 w-full md:h-44" />
      </ViewTransition>
      <div className="min-w-0">
        <Meta blog={blog} />
        <h3 className="mt-2 font-display text-xl font-bold text-ink transition-colors group-hover:text-coral md:text-3xl">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bark/70 md:line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-coral/0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-coral">
          Read the entry →
        </span>
      </div>
    </Link>
  );
}
