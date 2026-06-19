"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import SectionEditor, { type DraftSection } from "@/components/SectionEditor";
import SectionView from "@/components/SectionView";
import Thumb from "@/components/Thumb";
import CoverFallback from "@/components/CoverFallback";
import ImageUpload from "@/components/ImageUpload";
import type { BlogSection, SectionKind } from "@/lib/types";
import { revalidatePaths } from "@/lib/revalidate";

const TABS: { kind: SectionKind; label: string; icon: string }[] = [
  { kind: "title", label: "Heading", icon: "H" },
  { kind: "paragraph", label: "Paragraph", icon: "¶" },
  { kind: "quote", label: "Quote", icon: "❝" },
  { kind: "image", label: "Image", icon: "🖼" },
];

export interface EditorInitial {
  id: string;
  title: string;
  cover_image: string | null;
  sections: BlogSection[];
}

export default function BlogEditor({ initial }: { initial?: EditorInitial }) {
  const router = useRouter();
  const { user, loading, owner } = useAuth();
  const supabase = createClient();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [cover, setCover] = useState(initial?.cover_image ?? "");
  const [sections, setSections] = useState<DraftSection[]>(
    initial?.sections.map((s) => ({
      kind: s.kind,
      content: s.content ?? "",
      image_url: s.image_url ?? "",
      align: s.align ?? "left",
    })) ?? [],
  );
  const [nextKind, setNextKind] = useState<SectionKind>("paragraph");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initial;

  useEffect(() => {
    if (!loading && !owner) router.replace("/");
  }, [loading, owner, router]);

  const addSection = () =>
    setSections((s) => [
      ...s,
      { kind: nextKind, content: "", image_url: "", align: "left" },
    ]);
  const updateSection = (i: number, next: DraftSection) =>
    setSections((s) => s.map((sec, idx) => (idx === i ? next : sec)));
  const deleteSection = (i: number) =>
    setSections((s) => s.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setSections((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const copy = [...s];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  function sectionRows(blogId: string) {
    return sections.map((s, position) => ({
      blog_id: blogId,
      kind: s.kind,
      content: s.kind === "image" ? null : s.content,
      image_url: s.kind === "image" ? s.image_url : null,
      align: s.align,
      position,
    }));
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError("Please give your blog a title.");
      return;
    }
    setSaving(true);

    const firstParagraph = sections.find((s) => s.kind === "paragraph");
    const firstImage = sections.find(
      (s) => s.kind === "image" && s.image_url.trim(),
    );
    const meta = {
      title: title.trim(),
      excerpt: firstParagraph?.content?.slice(0, 240) ?? null,
      cover_image: cover.trim() || firstImage?.image_url || null,
      read_time: `${Math.max(1, Math.round(sections.length / 2))} min read`,
    };

    let blogId = initial?.id;

    if (isEdit) {
      const { error: upErr } = await supabase
        .from("blogs")
        .update(meta)
        .eq("id", blogId!);
      if (upErr) return fail(upErr.message);
      await supabase.from("blog_sections").delete().eq("blog_id", blogId!);
    } else {
      const { data: blog, error: insErr } = await supabase
        .from("blogs")
        .insert({ ...meta, author_id: user!.id })
        .select()
        .single();
      if (insErr || !blog) return fail(insErr?.message ?? "Could not save.");
      blogId = blog.id;
    }

    if (sections.length > 0) {
      const { error: secErr } = await supabase
        .from("blog_sections")
        .insert(sectionRows(blogId!));
      if (secErr) return fail(secErr.message);
    }

    await revalidatePaths(["/", "/blogs", `/blogs/${blogId}`]);
    router.push(`/blogs/${blogId}`);
    router.refresh();
  }

  function fail(msg: string) {
    setSaving(false);
    setError(msg);
  }

  if (loading || !owner) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-24 text-center text-ink/50">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <p className="mb-3 text-sm uppercase tracking-[0.25em] text-coral/70">
        {isEdit ? "Editing post" : "New post"}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ───────── Editor column ───────── */}
        <div className="flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your story a title…"
            className="w-full rounded-2xl bg-white/90 px-6 py-5 font-display text-2xl font-bold text-ink shadow-sm ring-1 ring-maple/10 outline-none transition focus:ring-2 focus:ring-coral md:text-3xl"
          />

          {/* Cover image */}
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-maple/10">
            <label className="text-xs font-semibold uppercase tracking-widest text-coral/80">
              Header image
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
              <input
                type="url"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Upload, or paste an image URL"
                className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none transition focus:border-coral"
              />
              <ImageUpload label="Upload" onUploaded={setCover} />
            </div>
            {cover.trim() && (
              <div className="mt-3 flex items-center gap-3">
                <Thumb src={cover} alt="cover" className="h-16 w-24" />
                <button
                  type="button"
                  onClick={() => setCover("")}
                  className="text-xs text-ink/50 hover:text-coral"
                >
                  Remove
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-ink/40">
              Leave empty to use the falling-leaves header.
            </p>
          </div>

          {/* Sections */}
          <div className="rounded-2xl bg-graybox/30 p-4">
            <div className="flex flex-col gap-3">
              {sections.map((s, i) => (
                <SectionEditor
                  key={i}
                  section={s}
                  index={i}
                  count={sections.length}
                  onChange={(next) => updateSection(i, next)}
                  onDelete={() => deleteSection(i)}
                  onMove={(dir) => move(i, dir)}
                />
              ))}
              {sections.length === 0 && (
                <p className="py-8 text-center text-ink/40">
                  Add your first block below.
                </p>
              )}
            </div>

            {/* Add-block toolbar */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {TABS.map((t) => (
                  <button
                    key={t.kind}
                    type="button"
                    onClick={() => setNextKind(t.kind)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition active:scale-95 ${
                      nextKind === t.kind
                        ? "bg-coral text-white shadow-inner"
                        : "bg-white text-ink hover:bg-peach/40"
                    }`}
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={addSection}
                className="rounded-lg border-2 border-coral px-5 py-2 font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
              >
                + Add block
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
              {error}
            </p>
          )}
        </div>

        {/* ───────── Live preview column ───────── */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
            Live preview
          </div>
          <div className="overflow-hidden rounded-3xl bg-cream/80 shadow-[var(--shadow-warm)] ring-1 ring-maple/10">
            {/* Cover header */}
            <div className="relative h-48 w-full">
              {cover.trim() ? (
                <Thumb src={cover} alt={title} className="h-full w-full" rounded="rounded-none" />
              ) : (
                <CoverFallback />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bark/55 via-bark/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1 className="font-display text-2xl font-bold text-white drop-shadow md:text-3xl">
                  {title || "Your title appears here"}
                </h1>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-5 p-6">
              {sections.length === 0 ? (
                <p className="text-center text-ink/40">
                  Your formatted post will appear here as you write.
                </p>
              ) : (
                sections.map((s, i) => (
                  <SectionView key={i} section={s} index={i} compact />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-20 mt-8 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-maple/10 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push(isEdit ? `/blogs/${initial!.id}` : "/blogs")}
          className="rounded-lg px-6 py-3 text-ink/60 transition hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-coral px-8 py-3 font-medium text-white shadow-sm transition hover:bg-coral-dark hover:shadow-md active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </div>
  );
}
