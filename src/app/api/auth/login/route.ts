import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";

/**
 * Rate-limited server-side login. Performs the password sign-in with the SSR
 * Supabase client so the session cookies are set server-side, and throttles by
 * IP + email to blunt brute-force. Errors are intentionally generic (no account
 * enumeration).
 */
export async function POST(req: Request) {
  sweep();
  const ip = getClientIp(req);

  const rl = rateLimit(`login:${ip}`, 5, 5 * 60_000); // 5 attempts / 5 min / IP
  if (!rl.ok)
    return NextResponse.json(
      { ok: false, error: "Too many attempts — please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password)
    return NextResponse.json({ ok: false, error: "Missing credentials." }, { status: 400 });

  const emailRl = rateLimit(`login-email:${email}`, 8, 10 * 60_000);
  if (!emailRl.ok)
    return NextResponse.json(
      { ok: false, error: "Too many attempts — please try again later." },
      { status: 429 },
    );

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error)
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 },
    );

  return NextResponse.json({ ok: true });
}
