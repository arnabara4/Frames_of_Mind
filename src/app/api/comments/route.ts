import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { rateLimit, sweep } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/ip";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const blogId = String(body.blog_id ?? "");
  const parentId = body.parent_id ? String(body.parent_id) : null;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const text = String(body.body ?? "").trim();

  if (!UUID.test(blogId))
    return NextResponse.json({ ok: false, error: "Unknown post." }, { status: 400 });
  if (parentId && !UUID.test(parentId))
    return NextResponse.json({ ok: false, error: "Invalid reply." }, { status: 400 });

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Please add your name.";
  else if (name.length > 60) fieldErrors.name = "Name is too long (60 max).";
  if (!email) fieldErrors.email = "Please add your email.";
  else if (!EMAIL.test(email) || email.length > 160)
    fieldErrors.email = "That email doesn't look right.";
  if (!text) fieldErrors.body = "Write something first.";
  else if (text.length > 2000) fieldErrors.body = "Comment is too long (2000 max).";
  if (Object.keys(fieldErrors).length)
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });

  const supabase = createPublicClient();

  // The post must exist; a reply's parent must be a TOP-LEVEL comment on it.
  const { data: blog } = await supabase
    .from("blogs")
    .select("id")
    .eq("id", blogId)
    .maybeSingle();
  if (!blog)
    return NextResponse.json({ ok: false, error: "Unknown post." }, { status: 400 });

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

  const { data: inserted, error } = await supabase
    .from("comments")
    .insert({
      blog_id: blogId,
      parent_id: parentId,
      author_name: name,
      author_email: email,
      body: text,
    })
    .select("id, blog_id, parent_id, author_name, body, created_at")
    .single();

  if (error || !inserted)
    return NextResponse.json(
      { ok: false, error: "Could not post — please try again." },
      { status: 500 },
    );

  return NextResponse.json({ ok: true, comment: inserted });
}
