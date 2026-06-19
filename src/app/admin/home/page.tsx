import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth";
import HomeEditor from "@/components/HomeEditor";
import type { HomeContent } from "@/lib/home";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isOwner(user)) redirect("/");

  const { data } = await supabase
    .from("home_content")
    .select("data")
    .eq("key", "home")
    .maybeSingle();

  return <HomeEditor initial={(data?.data ?? null) as Partial<HomeContent> | null} />;
}
