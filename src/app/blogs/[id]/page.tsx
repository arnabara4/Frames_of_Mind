import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Blog, BlogSection } from "@/lib/types";
import { formatDate } from "@/lib/types";
import SectionRenderer from "@/components/SectionRenderer";
import BlogOwnerActions from "@/components/BlogOwnerActions";
import Thumb from "@/components/Thumb";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!blog) notFound();
  const post = blog as Blog;

  const { data: sectionsData } = await supabase
    .from("blog_sections")
    .select("*")
    .eq("blog_id", id)
    .order("position", { ascending: true });

  const sections = (sectionsData ?? []) as BlogSection[];

  return (
    <article className="mx-auto max-w-[1000px] px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <Link
          href="/blogs"
          className="text-sm text-coral transition hover:-translate-x-0.5 hover:underline"
        >
          ← Back to blogs
        </Link>
        <BlogOwnerActions blogId={post.id} />
      </div>

      {/* Cover hero — flows straight into the meta + title below */}
      <Reveal className="mt-6">
        <div className="relative">
          <Thumb
            src={post.cover_image}
            alt={post.title}
            seed={0}
            className="h-64 w-full rounded-3xl md:h-96"
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-bark/55 via-bark/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-sm text-white/80">
              {formatDate(post.created_at)} · {post.read_time ?? "2 min read"}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white drop-shadow-md md:text-5xl">
              {post.title}
            </h1>
          </div>
        </div>
      </Reveal>

      {/* Article body */}
      <div className="mt-10 flex flex-col gap-8">
        {sections.length === 0 ? (
          <p className="prose-fom mx-auto">
            {post.excerpt ?? "This blog has no content yet."}
          </p>
        ) : (
          sections.map((s, i) => (
            <SectionRenderer key={s.id} section={s} index={i} />
          ))
        )}
      </div>

      <div className="mt-16 flex justify-center">
        <Link
          href="/blogs"
          className="rounded-full border-2 border-coral px-8 py-2.5 font-medium text-coral transition hover:bg-coral hover:text-white"
        >
          ← All posts
        </Link>
      </div>
    </article>
  );
}
