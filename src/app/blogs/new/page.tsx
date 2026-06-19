"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import SectionEditor, {
  type DraftSection,
} from "@/components/SectionEditor";
import type { SectionKind } from "@/lib/types";

const TABS: { kind: SectionKind; label: string }[] = [
  { kind: "image", label: "Image" },
  { kind: "paragraph", label: "Para" },
  { kind: "title", label: "Title" },
  { kind: "quote", label: "Quote" },
];

export default function NewBlogPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<DraftSection[]>([]);
  const [nextKind, setNextKind] = useState<SectionKind>("paragraph");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/blogs/new");
  }, [loading, user, router]);

  const addSection = () =>
    setSections((s) => [...s, { kind: nextKind, content: "", image_url: "" }]);

  const updateSection = (i: number, next: DraftSection) =>
    setSections((s) => s.map((sec, idx) => (idx === i ? next : sec)));

  const deleteSection = (i: number) =>
    setSections((s) => s.filter((_, idx) => idx !== i));

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

    const { data: blog, error: blogErr } = await supabase
      .from("blogs")
      .insert({
        title: title.trim(),
        excerpt: firstParagraph?.content?.slice(0, 240) ?? null,
        cover_image: firstImage?.image_url || null,
        read_time: `${Math.max(1, Math.round(sections.length / 2))} min read`,
        author_id: user!.id,
      })
      .select()
      .single();

    if (blogErr || !blog) {
      setSaving(false);
      setError(blogErr?.message ?? "Could not save the blog.");
      return;
    }

    if (sections.length > 0) {
      const rows = sections.map((s, position) => ({
        blog_id: blog.id,
        kind: s.kind,
        content: s.kind === "image" ? null : s.content,
        image_url: s.kind === "image" ? s.image_url : null,
        position,
      }));
      const { error: secErr } = await supabase
        .from("blog_sections")
        .insert(rows);
      if (secErr) {
        setSaving(false);
        setError(secErr.message);
        return;
      }
    }

    router.push(`/blogs/${blog.id}`);
    router.refresh();
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-20 text-center text-ink/50">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My First Blog Ever"
        className="w-full rounded-2xl bg-white px-8 py-6 font-display text-3xl font-bold text-ink shadow-sm outline-none ring-1 ring-black/5 focus:ring-coral md:text-4xl"
      />

      <div className="mt-6 rounded-3xl bg-graybox/40 p-6 md:p-8">
        <div className="flex flex-col gap-5">
          {sections.map((s, i) => (
            <SectionEditor
              key={i}
              section={s}
              index={i}
              onChange={(next) => updateSection(i, next)}
              onDelete={() => deleteSection(i)}
            />
          ))}
          {sections.length === 0 && (
            <p className="py-6 text-center text-ink/50">
              Pick a block type below and add your first section.
            </p>
          )}
        </div>

        {/* Section type toolbar */}
        <div className="mt-8 flex flex-col items-end gap-4">
          <div className="flex overflow-hidden rounded-lg ring-1 ring-black/15">
            {TABS.map((t) => (
              <button
                key={t.kind}
                type="button"
                onClick={() => setNextKind(t.kind)}
                className={`px-5 py-2 text-sm transition ${
                  nextKind === t.kind
                    ? "bg-coral text-white"
                    : "bg-white text-ink hover:bg-peach/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={addSection}
            className="rounded-lg border-2 border-coral px-6 py-2 font-medium text-coral transition hover:bg-coral hover:text-white"
          >
            Add Section
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push("/blogs")}
          className="rounded-lg px-6 py-3 text-ink/60 hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-coral px-8 py-3 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
        >
          {saving ? "Publishing…" : "Publish Blog"}
        </button>
      </div>
    </div>
  );
}
