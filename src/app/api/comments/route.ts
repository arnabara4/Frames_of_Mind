import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";

// Only Gmail addresses are accepted — enforced here and mirrored in the DB
// check constraint so the commenters table stays clean.
const GMAIL = /^[a-zA-Z0-9._%+\-]+@gmail\.com$/i;
const UUID  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  sweep();
  const ip = getClientIp(req);

  const perMin = rateLimit(`comment:${ip}`, 8, 60_000);
  if (!perMin.ok)
    return NextResponse.json(
      { ok: false, error: "You're commenting too fast — give it a moment." },
      { status: 429, headers: { "Retry-After": String(perMin.retryAfter) } },
    );
  const perHour = rateLimit(`comment-h:${ip}`, 80, 3_600_000);
  if (!perHour.ok)
    return NextResponse.json(
      { ok: false, error: "That's a lot of comments today — try again later." },
      { status: 429 },
    );

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  // Honeypot — bots fill hidden fields. Pretend success, drop silently.
  if (typeof body.website === "string" && body.website.trim())
    return NextResponse.json({ ok: true, comment: null });

  const blogId  = String(body.blog_id  ?? "");
  const parentId = body.parent_id ? String(body.parent_id) : null;
  const name    = String(body.name  ?? "").trim();
  const email   = String(body.email ?? "").trim().toLowerCase();
  const text    = String(body.body  ?? "").trim();

  if (!UUID.test(blogId))
    return NextResponse.json({ ok: false, error: "Unknown post." }, { status: 400 });
  if (parentId && !UUID.test(parentId))
    return NextResponse.json({ ok: false, error: "Invalid reply." }, { status: 400 });

  // ── Field validation ─────────────────────────────────────────────────
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please add your display name.";
  else if (name.length > 60) fieldErrors.name = "Name is too long (60 max).";

  if (!email) fieldErrors.email = "Please add your Gmail address.";
  else if (!GMAIL.test(email)) fieldErrors.email = "Only Gmail addresses are accepted (@gmail.com).";
  else if (email.length > 160) fieldErrors.email = "Email is too long.";

  if (!text) fieldErrors.body = "Write something first.";
  else if (text.length > 2000) fieldErrors.body = "Comment is too long (2000 max).";

  if (Object.keys(fieldErrors).length)
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });

  const supabase = createPublicClient();

  // ── Post must exist ──────────────────────────────────────────────────
  const { data: blog } = await supabase
    .from("blogs")
    .select("id")
    .eq("id", blogId)
    .maybeSingle();
  if (!blog)
    return NextResponse.json({ ok: false, error: "Unknown post." }, { status: 400 });

  // ── Reply parent must be a top-level comment on the same post ────────
  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id, blog_id, parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (!parent || parent.blog_id !== blogId || parent.parent_id)
      return NextResponse.json(
        { ok: false, error: "Can't reply to that comment." },
        { status: 400 },
      );
  }

  // ── Email↔name identity check (also registers new commenters) ────────
  // check_commenter is security-definer so it can read/write the
  // commenters table without exposing emails through the public API.
  const { data: check, error: checkErr } = await supabase
    .rpc("check_commenter", { p_email: email, p_name: name });

  if (checkErr)
    return NextResponse.json(
      { ok: false, error: "Could not verify your identity — try again." },
      { status: 500 },
    );

  const checkResult = check as { ok: boolean; field?: string; error?: string; canonical_name?: string } | null;

  if (!checkResult?.ok) {
    return NextResponse.json(
      { ok: false, fieldErrors: { [checkResult?.field ?? "name"]: checkResult?.error ?? "Validation failed." } },
      { status: 400 },
    );
  }

  // Use the canonical stored name so capitalisation stays consistent.
  const canonicalName = checkResult.canonical_name ?? name;

  // ── Insert the comment ───────────────────────────────────────────────
  const { data: inserted, error } = await supabase
    .from("comments")
    .insert({
      blog_id:      blogId,
      parent_id:    parentId,
      author_name:  canonicalName,
      author_email: email,
      body:         text,
    })
    .select("id, blog_id, parent_id, author_name, body, created_at")
    .single();

  if (error || !inserted)
    return NextResponse.json(
      { ok: false, error: "Could not post — please try again." },
      { status: 500 },
    );

  return NextResponse.json({ ok: true, comment: inserted, canonical_name: canonicalName });
}
