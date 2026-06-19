"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Blog } from "@/lib/types";
import { BlogCard } from "@/components/BlogCard";
import { useAuth } from "@/components/AuthProvider";

export default function BlogsExplorer({ blogs }: { blogs: Blog[] }) {
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.excerpt ?? "").toLowerCase().includes(q),
    );
  }, [blogs, query]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-4xl font-extrabold text-coral md:text-6xl">
          MY BLOGS
        </h1>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full rounded-full border border-black/15 px-6 py-3 outline-none focus:border-coral md:w-96"
        />
      </div>

      {user && (
        <div className="mt-6 flex justify-end">
          <Link
            href="/blogs/new"
            className="rounded-xl border-2 border-coral px-7 py-2.5 font-medium text-coral transition hover:bg-coral hover:text-white"
          >
            ADD BLOG
          </Link>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="text-ink/50">No blogs found.</p>
        ) : (
          filtered.map((b, i) => <BlogCard key={b.id} blog={b} seed={i} />)
        )}
      </div>
    </div>
  );
}
