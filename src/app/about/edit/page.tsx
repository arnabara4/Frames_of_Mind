import { createClient } from "@/lib/supabase/server";
import type { AboutBlock } from "@/lib/types";
import AboutBuilder from "@/components/AboutBuilder";

export const dynamic = "force-dynamic";

export default async function AboutEditPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_blocks")
    .select("*")
    .order("position", { ascending: true });

  return <AboutBuilder initial={(data ?? []) as AboutBlock[]} />;
}
