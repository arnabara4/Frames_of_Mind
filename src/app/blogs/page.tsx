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

  return <BlogsExplorer blogs={(data ?? []) as Blog[]} />;
}
