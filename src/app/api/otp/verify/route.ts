import { NextResponse } from "next/server";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";
import { createPublicClient } from "@/lib/supabase/public";
import { signToken } from "@/lib/otp";

export async function POST(req: Request) {
  sweep();
  const rl = rateLimit(`otp-verify:${getClientIp(req)}`, 10, 10 * 60_000);
  if (!rl.ok)
    return NextResponse.json({ ok: false, error: "Too many attempts." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const code = String(body?.code ?? "").trim();
  if (!email || !code)
    return NextResponse.json({ ok: false, error: "Missing code." }, { status: 400 });

  // Verify the code with Supabase (cookieless — the returned session is ignored
  // so the visitor is never actually signed in).
  const supabase = createPublicClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  if (error)
    return NextResponse.json(
      { ok: false, error: "Invalid or expired code." },
      { status: 400 },
    );

  return NextResponse.json({ ok: true, token: signToken(email) });
}
