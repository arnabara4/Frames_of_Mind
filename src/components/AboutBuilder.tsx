"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import AboutBlockEditor, { type DraftBlock } from "@/components/AboutBlockEditor";
import AboutBlockView from "@/components/AboutBlockView";
import LeafBurst from "@/components/LeafBurst";
import Thumb from "@/components/Thumb";
import { renderRich } from "@/lib/format";
import { ALIGN_CLASS, FONT_CLASS, SIZE_CLASS } from "@/lib/types";
import type { AboutBlock, AboutKind } from "@/lib/types";
import { revalidatePaths } from "@/lib/revalidate";

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
    img_width: "md",
    img_pct: kind === "split" ? 50 : kind === "image" ? 60 : null,
    img_h: kind === "split" ? 256 : kind === "image" ? 288 : null,
    img_side: "left",
    text_x: 0,
    text_y: 0,
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
      img_h: b.img_h,
      img_side: b.img_side ?? "left",
      text_x: b.text_x ?? 0,
      text_y: b.text_y ?? 0,
    })),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(0);
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2600);
    return () => clearTimeout(t);
  }, [saved]);

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

  /** Arrow keys nudge the selected split block's text (Canva-style). */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected == null) return;
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      if (tag === "input" || tag === "textarea") return; // don't hijack typing
      const b = blocks[selected];
      if (!b || b.kind !== "split") return;
      const step = e.shiftKey ? 10 : 2;
      let nx = b.text_x;
      let ny = b.text_y;
      if (e.key === "ArrowLeft") nx -= step;
      else if (e.key === "ArrowRight") nx += step;
      else if (e.key === "ArrowUp") ny -= step;
      else if (e.key === "ArrowDown") ny += step;
      else return;
      e.preventDefault();
      update(selected, { ...b, text_x: nx, text_y: ny });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, blocks]);

  async function save() {
    setError(null);
    setSaving(true);
    const rows = blocks.map((b, position) => ({
      kind: b.kind,
      content: b.kind === "image" || b.kind === "divider" ? null : b.content,
      image_url: b.kind === "image" || b.kind === "split" ? b.image_url : null,
      align: b.align,
      font: b.font,
      size: b.size,
      img_width: b.img_width,
      img_pct: b.img_pct,
      img_h: b.img_h,
      img_side: b.img_side,
      text_x: b.text_x,
      text_y: b.text_y,
      position,
    }));
    // Atomic replace — delete + insert run in one transaction, so a failure
    // can never leave the page empty.
    const { error: err } = await supabase.rpc("set_about_blocks", { blocks: rows });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    await revalidatePaths(["/about"]);
    setSaved(true);
    setBurst((b) => b + 1);
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
      <LeafBurst trigger={burst} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <button
          type="button"
          onClick={() => router.push("/about")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-maple/20 bg-white/60 px-4 py-1.5 text-sm font-medium text-bark/70 transition hover:-translate-x-0.5 hover:border-coral hover:text-coral"
        >
          ← Back
        </button>
        <span className="text-[11px] uppercase tracking-[0.18em] text-coral/70 sm:text-sm sm:tracking-[0.25em]">
          Editing the About page
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="rounded-2xl bg-graybox/30 p-4">
          <div className="flex flex-col gap-3">
            {blocks.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <AboutBlockEditor
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
              </motion.div>
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
                    onResize={(pct, h) => update(i, { ...b, img_pct: pct, img_h: h })}
                    onMoveText={(x, y) => update(i, { ...b, text_x: x, text_y: y })}
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

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-br from-coral to-maple px-6 py-3 text-white shadow-[0_20px_50px_-15px_rgba(156,52,21,0.7)]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-sm">
                ✓
              </span>
              <span className="text-sm font-semibold">Saved successfully 🍂</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A preview block: click to select. Image/split blocks render a resizable
 *  image box with MS-Word-style corner + edge handles (width AND height). */
function PreviewItem({
  block,
  index,
  selected,
  onSelect,
  onResize,
  onMoveText,
}: {
  block: DraftBlock;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onResize: (pct: number, h: number) => void;
  onMoveText: (x: number, y: number) => void;
}) {
  const wrapClass = `group relative cursor-pointer rounded-xl p-3 transition ${
    selected ? "bg-white/45" : "hover:bg-white/25"
  }`;

  if (block.kind === "image") {
    const justify =
      block.align === "left"
        ? "justify-start"
        : block.align === "right"
          ? "justify-end"
          : "justify-center";
    return (
      <div onClick={onSelect} className={wrapClass}>
        <div className={`flex w-full ${justify}`}>
          <ResizableImage
            src={block.image_url}
            seed={index}
            pct={block.img_pct ?? 100}
            h={block.img_h ?? 288}
            selected={selected}
            onResize={onResize}
          />
        </div>
      </div>
    );
  }

  if (block.kind === "split") {
    const img = (
      <ResizableImage
        src={block.image_url}
        seed={index}
        pct={block.img_pct ?? 50}
        h={block.img_h ?? 256}
        selected={selected}
        onResize={onResize}
        basis
      />
    );
    const text = (
      <div className="min-w-0 flex-1 self-center">
        <DraggableText
          block={block}
          onSelect={onSelect}
          onMove={onMoveText}
          selected={selected}
        />
      </div>
    );
    return (
      <div onClick={onSelect} className={wrapClass}>
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {block.img_side === "right" ? (
            <>
              {text}
              {img}
            </>
          ) : (
            <>
              {img}
              {text}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onSelect} className={wrapClass}>
      <AboutBlockView block={block} index={index} />
    </div>
  );
}

/** The split block's text — selectable, draggable, and arrow-nudgeable. */
function DraggableText({
  block,
  selected,
  onSelect,
  onMove,
}: {
  block: DraftBlock;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}) {
  function start(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const sx = e.clientX;
    const sy = e.clientY;
    const ox = block.text_x;
    const oy = block.text_y;
    let raf = 0;
    let lastEv: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (lastEv) onMove(ox + (lastEv.clientX - sx), oy + (lastEv.clientY - sy));
    };
    const move = (ev: PointerEvent) => {
      lastEv = ev;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const up = () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ transform: `translate(${block.text_x}px, ${block.text_y}px)` }}
      className={`group/txt relative whitespace-pre-wrap leading-relaxed text-bark/85 ${FONT_CLASS[block.font]} ${SIZE_CLASS[block.size]} ${ALIGN_CLASS[block.align]}`}
    >
      {/* Small drag grip — the only move affordance, so nothing boxes over the image */}
      <button
        type="button"
        onPointerDown={start}
        title="Drag to move · arrow keys to nudge"
        className={`absolute -top-3 left-0 z-10 inline-flex cursor-move touch-none items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[10px] font-semibold text-white shadow transition ${
          selected ? "opacity-100" : "opacity-0 group-hover/txt:opacity-100"
        }`}
      >
        ⠿ move
      </button>
      {renderRich(block.content) || (
        <span className="text-ink/30">Text wraps around the image…</span>
      )}
    </div>
  );
}

// Each handle: position classes + which axes it drags (sx = width, sy = height).
const HANDLES: { pos: string; cursor: string; sx: number; sy: number }[] = [
  { pos: "-left-1.5 -top-1.5", cursor: "cursor-nwse-resize", sx: -1, sy: -1 },
  { pos: "left-1/2 -top-1.5 -translate-x-1/2", cursor: "cursor-ns-resize", sx: 0, sy: -1 },
  { pos: "-right-1.5 -top-1.5", cursor: "cursor-nesw-resize", sx: 1, sy: -1 },
  { pos: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize", sx: 1, sy: 0 },
  { pos: "-right-1.5 -bottom-1.5", cursor: "cursor-nwse-resize", sx: 1, sy: 1 },
  { pos: "left-1/2 -bottom-1.5 -translate-x-1/2", cursor: "cursor-ns-resize", sx: 0, sy: 1 },
  { pos: "-left-1.5 -bottom-1.5", cursor: "cursor-nesw-resize", sx: -1, sy: 1 },
  { pos: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "cursor-ew-resize", sx: -1, sy: 0 },
];

/** Image with MS-Word selection handles. Corners + side edges resize width (%
 *  of the container); top/bottom edges + corners resize height (px). Width is
 *  clamped to 100% so the image always stays inside its container. */
function ResizableImage({
  src,
  seed,
  pct,
  h,
  selected,
  onResize,
  basis = false,
}: {
  src: string | null;
  seed: number;
  pct: number;
  h: number;
  selected: boolean;
  onResize: (pct: number, h: number) => void;
  basis?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function start(e: React.PointerEvent, sx: number, sy: number) {
    e.preventDefault();
    e.stopPropagation();
    const wrap = ref.current;
    if (!wrap) return;
    const pw = wrap.parentElement?.getBoundingClientRect().width ?? 1;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPct = pct;
    const startH = h;
    let raf = 0;
    let lastEv: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const ev = lastEv;
      if (!ev) return;
      const nextPct = sx
        ? Math.max(15, Math.min(100, Math.round(startPct + ((ev.clientX - startX) / pw) * 100 * sx)))
        : startPct;
      const nextH = sy
        ? Math.max(96, Math.min(640, Math.round(startH + (ev.clientY - startY) * sy)))
        : startH;
      onResize(nextPct, nextH);
    };
    const move = (ev: PointerEvent) => {
      lastEv = ev;
      if (!raf) raf = requestAnimationFrame(apply); // throttle to one update / frame
    };
    const up = () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      ref={ref}
      style={
        basis
          ? { flexBasis: `${pct}%` }
          : { width: `${pct}%`, maxWidth: "100%" }
      }
      className={`group/img relative ${basis ? "min-w-0 shrink-0 self-start" : ""}`}
    >
      <Thumb src={src} alt="About image" seed={seed} framed natural className="w-full" />

      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl transition ${
          selected
            ? "ring-1 ring-coral/70"
            : "opacity-0 ring-1 ring-coral/30 group-hover/img:opacity-100"
        }`}
      />
      {HANDLES.filter((hd) => hd.sx !== 0).map((hd, i) => (
        <span
          key={i}
          onPointerDown={(e) => start(e, hd.sx, hd.sy)}
          className={`absolute ${hd.pos} ${hd.cursor} z-10 h-2.5 w-2.5 rounded-full border border-coral bg-white shadow-sm transition ${
            selected ? "opacity-100" : "opacity-0 group-hover/img:opacity-100"
          }`}
        />
      ))}
    </div>
  );
}

