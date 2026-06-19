"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Blog } from "@/lib/types";
import { BlogCard } from "@/components/BlogCard";
import { useAuth } from "@/components/AuthProvider";
import { StaggerGrid, StaggerItem } from "@/components/motion";

export default function BlogsExplorer({ blogs }: { blogs: Blog[] }) {
  const [query, setQuery] = useState("");
  const { owner } = useAuth();

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

      {owner && (
        <div className="mt-6 flex justify-end gap-3">
          <Link
            href="/admin"
            className="rounded-xl px-5 py-2.5 font-medium text-ink/60 transition hover:text-coral"
          >
            Dashboard
          </Link>
          <Link
            href="/blogs/new"
            className="rounded-xl border-2 border-coral px-7 py-2.5 font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
          >
            ADD BLOG
          </Link>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-bark/50">No blogs found.</p>
      ) : (
        <StaggerGrid
          key={query}
          className="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-2"
        >
          {filtered.map((b, i) => (
            <StaggerItem key={b.id} className="h-full">
              <BlogCard blog={b} seed={i} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
