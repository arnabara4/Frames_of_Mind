import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth";

/**
 * Owner-only on-demand cache invalidation. The client editors call this after a
 * successful save/delete so the ISR'd public pages refresh immediately instead
 * of waiting for the revalidate window.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isOwner(user)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const paths: string[] =
    Array.isArray(body?.paths) && body.paths.length
      ? body.paths
      : ["/", "/blogs", "/about"];

  for (const p of paths) {
    if (typeof p === "string" && p.startsWith("/")) revalidatePath(p);
  }
  return NextResponse.json({ ok: true, revalidated: paths });
}
