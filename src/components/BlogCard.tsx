import Link from "next/link";
import type { Blog } from "@/lib/types";
import { formatDate } from "@/lib/types";
import Thumb from "@/components/Thumb";

/** Vertical card used in the /blogs grid. */
export function BlogCard({ blog, seed = 0 }: { blog: Blog; seed?: number }) {
  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="group block h-full rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-maple/10 backdrop-blur transition-shadow duration-300 hover:shadow-[var(--shadow-warm)]"
    >
      <Thumb
        src={blog.cover_image}
        alt={blog.title}
        seed={seed}
        framed
        className="h-56 w-full"
      />
      <p className="mt-4 text-sm text-bark/50">
        {formatDate(blog.created_at)} · {blog.read_time ?? "2 min read"}
      </p>
      <h3 className="mt-1 font-display text-2xl font-bold text-ink transition-colors group-hover:text-coral">
        {blog.title}
      </h3>
      {blog.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-bark/70">
          {blog.excerpt}
        </p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coral opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
        Read more →
      </span>
    </Link>
  );
}

/** Horizontal row used in the home "Recent Blogs" list. */
export function BlogRow({ blog, seed = 0 }: { blog: Blog; seed?: number }) {
  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="group grid grid-cols-[140px_1fr] gap-5 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-maple/10 backdrop-blur transition-shadow duration-300 hover:shadow-[var(--shadow-warm)] md:grid-cols-[300px_1fr] md:gap-8 md:p-6"
    >
      <Thumb
        src={blog.cover_image}
        alt={blog.title}
        seed={seed}
        framed
        className="h-28 w-full md:h-44"
      />
      <div className="min-w-0">
        <p className="text-xs text-bark/50 md:text-sm">
          {formatDate(blog.created_at)}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink transition-colors group-hover:text-coral md:text-3xl">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-bark/70 md:line-clamp-3">
            {blog.excerpt}
          </p>
        )}
        <div className="mt-4 h-px w-full bg-maple/10" />
      </div>
    </Link>
  );
}
