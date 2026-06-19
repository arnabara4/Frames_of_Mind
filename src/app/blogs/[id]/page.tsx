import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { Blog, BlogSection } from "@/lib/types";
import { formatDate } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import SectionRenderer from "@/components/SectionRenderer";
import BlogOwnerActions from "@/components/BlogOwnerActions";
import Thumb from "@/components/Thumb";
import CoverFallback from "@/components/CoverFallback";
import { Reveal } from "@/components/motion";

// Public, cacheable read — deduped between generateMetadata and the page.
const getPost = cache(async (id: string) => {
  const supabase = createPublicClient();
  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!blog) return null;
  const { data: sectionsData } = await supabase
    .from("blog_sections")
    .select("*")
    .eq("blog_id", id)
    .order("position", { ascending: true });
  return {
    post: blog as Blog,
    sections: (sectionsData ?? []) as BlogSection[],
  };
});

// Revalidate the rendered page at most once a minute (on-demand revalidation
// from the editor keeps it instantly fresh on edits).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getPost(id);
  if (!data) return { title: "Post not found" };
  const { post } = data;
  const desc = post.excerpt ?? `A story from ${SITE_NAME}.`;
  const url = `${SITE_URL}/blogs/${post.id}`;
  const images = post.cover_image ? [{ url: post.cover_image }] : undefined;
  return {
    title: post.title,
    description: desc,
    alternates: { canonical: `/blogs/${post.id}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: desc,
      url,
      publishedTime: post.created_at,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPost(id);
  if (!data) notFound();
  const { post, sections } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: { "@type": "Person", name: "Itsuki Nakano" },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blogs/${post.id}`,
  };

  return (
    <article className="mx-auto max-w-[1000px] px-6 py-8 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        <div className="relative h-64 overflow-hidden rounded-3xl md:h-96">
          {post.cover_image ? (
            <Thumb
              src={post.cover_image}
              alt={post.title}
              seed={0}
              rounded="rounded-3xl"
              className="h-full w-full"
              priority
              sizes="(max-width: 1000px) 100vw, 1000px"
            />
          ) : (
            <CoverFallback count={16} />
          )}
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
