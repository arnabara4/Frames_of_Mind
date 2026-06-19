"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import SectionEditor, { type DraftSection } from "@/components/SectionEditor";
import type { BlogSection, SectionKind } from "@/lib/types";

const TABS: { kind: SectionKind; label: string; icon: string }[] = [
  { kind: "image", label: "Image", icon: "🖼" },
  { kind: "paragraph", label: "Para", icon: "¶" },
  { kind: "title", label: "Title", icon: "H" },
  { kind: "quote", label: "Quote", icon: "❝" },
];

export interface EditorInitial {
  id: string;
  title: string;
  sections: BlogSection[];
}

export default function BlogEditor({ initial }: { initial?: EditorInitial }) {
  const router = useRouter();
  const { user, loading, owner } = useAuth();
  const supabase = createClient();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [sections, setSections] = useState<DraftSection[]>(
    initial?.sections.map((s) => ({
      kind: s.kind,
      content: s.content ?? "",
      image_url: s.image_url ?? "",
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
    setSections((s) => [...s, { kind: nextKind, content: "", image_url: "" }]);
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
      cover_image: firstImage?.image_url || null,
      read_time: `${Math.max(1, Math.round(sections.length / 2))} min read`,
    };

    let blogId = initial?.id;

    if (isEdit) {
      const { error: upErr } = await supabase
        .from("blogs")
        .update(meta)
        .eq("id", blogId!);
      if (upErr) return fail(upErr.message);
      // Replace sections wholesale — simplest correct sync.
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
    <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
      <p className="mb-3 text-sm uppercase tracking-[0.25em] text-coral/70">
        {isEdit ? "Editing post" : "New post"}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your story a title…"
        className="w-full rounded-2xl bg-white px-8 py-6 font-display text-3xl font-bold text-ink shadow-sm ring-1 ring-black/5 outline-none transition focus:ring-2 focus:ring-coral md:text-4xl"
      />

      <div className="mt-6 rounded-3xl bg-graybox/30 p-5 md:p-8">
        <div className="flex flex-col gap-4">
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
            <p className="py-10 text-center text-ink/40">
              Pick a block type below and add your first section.
            </p>
          )}
        </div>

        {/* Section type toolbar */}
        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex overflow-hidden rounded-xl ring-1 ring-black/10">
            {TABS.map((t) => (
              <button
                key={t.kind}
                type="button"
                onClick={() => setNextKind(t.kind)}
                className={`flex-1 px-5 py-2.5 text-sm font-medium transition active:scale-95 ${
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
            className="rounded-xl border-2 border-coral px-6 py-2.5 font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
          >
            + Add Section
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
          {error}
        </p>
      )}

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur">
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
