import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";
import { verifyToken } from "@/lib/otp";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  sweep();
  const ip = getClientIp(req);

  const perMin = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!perMin.ok)
    return NextResponse.json(
      { ok: false, error: "Too many messages — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(perMin.retryAfter) } },
    );
  const perHour = rateLimit(`contact-h:${ip}`, 20, 3_600_000);
  if (!perHour.ok)
    return NextResponse.json(
      { ok: false, error: "You've sent a lot today — try again later." },
      { status: 429 },
    );

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Honeypot — bots fill hidden fields. Pretend success, drop silently.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const first = String(body.first_name ?? "").trim();
  const last = String(body.last_name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.body ?? "").trim();

  if (
    !first || first.length > 100 ||
    last.length > 100 ||
    !EMAIL.test(email) || email.length > 200 ||
    !message || message.length > 5000
  ) {
    return NextResponse.json({ ok: false, error: "Please check your details." }, { status: 400 });
  }

  // Require a valid proof-of-verification token for this email (OTP gate).
  if (!verifyToken(String(body.token ?? ""), email)) {
    return NextResponse.json(
      { ok: false, error: "Please verify your email first." },
      { status: 401 },
    );
  }

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("messages")
    .insert({ first_name: first, last_name: last, email, body: message });

  if (error)
    return NextResponse.json({ ok: false, error: "Could not send — try again." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
