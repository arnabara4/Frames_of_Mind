import { createClient } from "@/lib/supabase/server";
import type { Blog } from "@/lib/types";
import BlogsExplorer from "@/components/BlogsExplorer";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  return <BlogsExplorer blogs={(data ?? []) as Blog[]} />;
}
