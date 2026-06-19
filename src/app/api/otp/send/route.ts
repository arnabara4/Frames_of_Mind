import { NextResponse } from "next/server";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";
import { createPublicClient } from "@/lib/supabase/public";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  sweep();
  const ip = getClientIp(req);
  const rl = rateLimit(`otp-send:${ip}`, 5, 10 * 60_000);
  if (!rl.ok)
    return NextResponse.json(
      { ok: false, error: "Too many codes requested — please wait." },
      { status: 429 },
    );

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200)
    return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });

  const perEmail = rateLimit(`otp-email:${email}`, 3, 10 * 60_000);
  if (!perEmail.ok)
    return NextResponse.json(
      { ok: false, error: "Too many codes for this email — please wait." },
      { status: 429 },
    );

  // Supabase delivers the 6-digit code (cookieless client → no session is set).
  const supabase = createPublicClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error)
    return NextResponse.json(
      { ok: false, error: "Couldn't send a code right now — please try again." },
      { status: 502 },
    );

  return NextResponse.json({ ok: true });
}
