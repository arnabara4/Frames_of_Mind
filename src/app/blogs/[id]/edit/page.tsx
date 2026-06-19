import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Blog, BlogSection } from "@/lib/types";
import BlogEditor from "@/components/BlogEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
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

  return (
    <BlogEditor
      initial={{
        id: post.id,
        title: post.title,
        cover_image: post.cover_image,
        sections: (sectionsData ?? []) as BlogSection[],
      }}
    />
  );
}
