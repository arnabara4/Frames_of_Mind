import { createPublicClient } from "@/lib/supabase/public";
import type { Blog } from "@/lib/types";
import BlogsExplorer from "@/components/BlogsExplorer";

export const revalidate = 60;

export default async function BlogsPage() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  const baseBlogs = (data ?? []) as Blog[];
  const counts = new Map<string, number>();
  if (baseBlogs.length) {
    const { data: cRows } = await supabase
      .from("comments")
      .select("blog_id")
      .in("blog_id", baseBlogs.map((b) => b.id));
    for (const r of (cRows ?? []) as { blog_id: string }[])
      counts.set(r.blog_id, (counts.get(r.blog_id) ?? 0) + 1);
  }
  const blogs: Blog[] = baseBlogs.map((b) => ({
    ...b,
    comment_count: counts.get(b.id) ?? 0,
  }));
  return <BlogsExplorer blogs={blogs} />;
}
