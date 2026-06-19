import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blogs")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const posts: MetadataRoute.Sitemap = (data ?? []).map((b) => ({
    url: `${SITE_URL}/blogs/${b.id}`,
    lastModified: b.created_at ? new Date(b.created_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blogs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  return [...staticRoutes, ...posts];
}
