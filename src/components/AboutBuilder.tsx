"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AboutBlockEditor, {
  type DraftBlock,
} from "@/components/AboutBlockEditor";
import AboutBlockView from "@/components/AboutBlockView";
import type { AboutBlock, AboutKind } from "@/lib/types";

const ADD: { kind: AboutKind; label: string; icon: string }[] = [
  { kind: "heading", label: "Heading", icon: "H" },
  { kind: "paragraph", label: "Paragraph", icon: "¶" },
  { kind: "list", label: "List", icon: "•" },
  { kind: "quote", label: "Quote", icon: "❝" },
  { kind: "image", label: "Image", icon: "🖼" },
  { kind: "divider", label: "Divider", icon: "—" },
];

function blank(kind: AboutKind): DraftBlock {
  return {
    kind,
    content: "",
    image_url: "",
    align: "left",
    font: kind === "heading" ? "display" : "serif",
    size: kind === "heading" ? "xl" : "md",
    img_width: "md",
  };
}

export default function AboutBuilder({ initial }: { initial: AboutBlock[] }) {
  const router = useRouter();
  const { loading, owner } = useAuth();
  const supabase = createClient();

  const [blocks, setBlocks] = useState<DraftBlock[]>(
    initial.map((b) => ({
      kind: b.kind,
      content: b.content ?? "",
      image_url: b.image_url ?? "",
      align: b.align,
      font: b.font,
      size: b.size,
      img_width: b.img_width,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !owner) router.replace("/");
  }, [loading, owner, router]);

  const add = (kind: AboutKind) => setBlocks((b) => [...b, blank(kind)]);
  const update = (i: number, next: DraftBlock) =>
    setBlocks((b) => b.map((x, idx) => (idx === i ? next : x)));
  const remove = (i: number) =>
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const c = [...b];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  async function save() {
    setError(null);
    setSaving(true);
    // Replace-all sync under owner RLS (position >= 0 matches every row).
    await supabase.from("about_blocks").delete().gte("position", 0);
    if (blocks.length > 0) {
      const rows = blocks.map((b, position) => ({
        kind: b.kind,
        content: b.kind === "image" || b.kind === "divider" ? null : b.content,
        image_url: b.kind === "image" ? b.image_url : null,
        align: b.align,
        font: b.font,
        size: b.size,
        img_width: b.img_width,
        position,
      }));
      const { error: err } = await supabase.from("about_blocks").insert(rows);
      if (err) {
        setSaving(false);
        setError(err.message);
        return;
      }
    }
    router.push("/about");
    router.refresh();
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
        Editing the About page
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="rounded-2xl bg-graybox/30 p-4">
          <div className="flex flex-col gap-3">
            {blocks.map((b, i) => (
              <AboutBlockEditor
                key={i}
                block={b}
                index={i}
                count={blocks.length}
                onChange={(next) => update(i, next)}
                onDelete={() => remove(i)}
                onMove={(dir) => move(i, dir)}
              />
            ))}
            {blocks.length === 0 && (
              <p className="py-8 text-center text-ink/40">
                Add a block below to start building.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {ADD.map((a) => (
              <button
                key={a.kind}
                type="button"
                onClick={() => add(a.kind)}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-peach/40 active:scale-95"
              >
                <span className="mr-1">{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
            Live preview
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-peach/40 to-salmon/20 p-8 shadow-[var(--shadow-warm)] ring-1 ring-maple/10">
            <div className="flex flex-col gap-6">
              {blocks.length === 0 ? (
                <p className="text-center text-ink/40">
                  Your About page appears here as you build it.
                </p>
              ) : (
                blocks.map((b, i) => (
                  <AboutBlockView key={i} block={b} index={i} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 z-20 mt-8 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-maple/10 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push("/about")}
          className="rounded-lg px-6 py-3 text-ink/60 transition hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-coral px-8 py-3 font-medium text-white shadow-sm transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save About Page"}
        </button>
      </div>
    </div>
  );
}
