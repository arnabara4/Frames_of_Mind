import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookieless anon client for PUBLIC reads (blogs, about, home content).
 * It carries no session, so pages using it can be statically cached / ISR'd
 * instead of being forced dynamic by cookie access.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
