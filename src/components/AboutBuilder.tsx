"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AboutBlockEditor, { type DraftBlock } from "@/components/AboutBlockEditor";
import AboutBlockView from "@/components/AboutBlockView";
import type { AboutBlock, AboutKind } from "@/lib/types";

const ADD: { kind: AboutKind; label: string; icon: string }[] = [
  { kind: "heading", label: "Heading", icon: "H" },
  { kind: "paragraph", label: "Paragraph", icon: "¶" },
  { kind: "list", label: "List", icon: "•" },
  { kind: "quote", label: "Quote", icon: "❝" },
  { kind: "image", label: "Image", icon: "🖼" },
  { kind: "split", label: "Image + Text", icon: "▥" },
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
    img_width: kind === "split" ? "md" : "md",
    img_pct: kind === "split" ? 50 : null,
    img_side: "left",
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
      img_pct: b.img_pct,
      img_side: b.img_side ?? "left",
    })),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!loading && !owner) router.replace("/");
  }, [loading, owner, router]);

  const add = (kind: AboutKind) => {
    setBlocks((b) => [...b, blank(kind)]);
    setSelected(blocks.length);
  };
  const update = (i: number, next: DraftBlock) =>
    setBlocks((b) => b.map((x, idx) => (idx === i ? next : x)));
  const remove = (i: number) => {
    setBlocks((b) => b.filter((_, idx) => idx !== i));
    setSelected(null);
  };
  const move = (i: number, dir: -1 | 1) =>
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const c = [...b];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  /** Click a block in the preview → select it and focus its editor. */
  function selectFromPreview(i: number) {
    setSelected(i);
    editorRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function save() {
    setError(null);
    setSaving(true);
    await supabase.from("about_blocks").delete().gte("position", 0);
    if (blocks.length > 0) {
      const rows = blocks.map((b, position) => ({
        kind: b.kind,
        content: b.kind === "image" || b.kind === "divider" ? null : b.content,
        image_url: b.kind === "image" || b.kind === "split" ? b.image_url : null,
        align: b.align,
        font: b.font,
        size: b.size,
        img_width: b.img_width,
        img_pct: b.img_pct,
        img_side: b.img_side,
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
                selected={selected === i}
                innerRef={(el) => {
                  editorRefs.current[i] = el;
                }}
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

        {/* Live, clickable preview */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
            Live preview · click a block to edit it
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-peach/40 to-salmon/20 p-6 shadow-[var(--shadow-warm)] ring-1 ring-maple/10 md:p-8">
            <div className="flex flex-col gap-5">
              {blocks.length === 0 ? (
                <p className="text-center text-ink/40">
                  Your About page appears here as you build it.
                </p>
              ) : (
                blocks.map((b, i) => (
                  <PreviewItem
                    key={i}
                    block={b}
                    index={i}
                    selected={selected === i}
                    onSelect={() => selectFromPreview(i)}
                    onResize={(pct) => update(i, { ...b, img_pct: pct })}
                  />
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

      {/* Polished action bar */}
      <div className="sticky bottom-5 z-30 mt-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full border border-maple/15 bg-cream/90 px-3 py-2.5 pl-6 shadow-[0_20px_50px_-20px_rgba(156,52,21,0.6)] backdrop-blur-md">
          <span className="flex items-center gap-2 text-sm text-bark/70">
            <span className="text-lg">🍂</span>
            <span className="hidden sm:inline font-serif italic">
              {blocks.length} block{blocks.length === 1 ? "" : "s"} · shaping your story
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/about")}
              className="rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-bark/60 transition hover:text-bark"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : "✓ Save Page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A preview block: click to select; image/split blocks get a drag-resize handle. */
function PreviewItem({
  block,
  index,
  selected,
  onSelect,
  onResize,
}: {
  block: DraftBlock;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onResize: (pct: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasImage = block.kind === "image" || block.kind === "split";
  const pct = block.img_pct ?? (block.kind === "split" ? 50 : 100);
  const rightSide = block.kind === "split" && block.img_side === "right";
  const handleLeft = rightSide ? 100 - pct : pct;

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const onMove = (ev: PointerEvent) => {
      let p = ((ev.clientX - rect.left) / rect.width) * 100;
      if (rightSide) p = 100 - p;
      onResize(Math.max(20, Math.min(100, Math.round(p))));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl p-2 transition ${
        selected ? "bg-white/50 ring-2 ring-coral" : "hover:bg-white/30 hover:ring-1 hover:ring-coral/30"
      }`}
    >
      <AboutBlockView block={block} index={index} />

      {hasImage && (
        <div
          onPointerDown={startDrag}
          title="Drag to resize image"
          style={{ left: `calc(${handleLeft}% - 6px)` }}
          className={`absolute top-1/2 z-10 hidden h-12 w-3 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-coral/80 shadow-md ring-2 ring-white transition group-hover:flex ${
            selected ? "flex" : ""
          }`}
        >
          <span className="text-[8px] leading-none text-white">⇔</span>
        </div>
      )}
    </div>
  );
}
