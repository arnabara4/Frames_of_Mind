import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Blog, BlogSection } from "@/lib/types";
import { formatDate } from "@/lib/types";
import SectionRenderer from "@/components/SectionRenderer";

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
    <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
      <Link href="/blogs" className="text-sm text-coral hover:underline">
        ← Back to blogs
      </Link>

      <div className="mt-6 rounded-3xl bg-graybox/50 p-6 md:p-10">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="text-sm text-ink/50">
            {formatDate(post.created_at)} · {post.read_time ?? "2 min read"}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink md:text-5xl">
            {post.title}
          </h1>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {sections.length === 0 ? (
            <p className="rounded-2xl bg-white px-8 py-6 text-ink/60 shadow-sm">
              {post.excerpt ?? "This blog has no content yet."}
            </p>
          ) : (
            sections.map((s, i) => (
              <SectionRenderer key={s.id} section={s} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
