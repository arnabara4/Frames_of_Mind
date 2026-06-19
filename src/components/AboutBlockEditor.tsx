"use client";

import { useRef } from "react";
import type {
  Align,
  AboutKind,
  FontChoice,
  ImgWidth,
  TextSize,
} from "@/lib/types";
import { FONT_LABEL, IMG_PCT_PRESET } from "@/lib/types";
import ImageUpload from "@/components/ImageUpload";
import Thumb from "@/components/Thumb";

export interface DraftBlock {
  kind: AboutKind;
  content: string;
  image_url: string;
  align: Align;
  font: FontChoice;
  size: TextSize;
  img_width: ImgWidth;
  img_pct: number | null;
  img_h: number | null;
  img_side: "left" | "right";
  text_x: number;
  text_y: number;
}

const KIND_OPTIONS: { v: AboutKind; label: string }[] = [
  { v: "heading", label: "Heading" },
  { v: "paragraph", label: "Paragraph" },
  { v: "list", label: "List" },
  { v: "quote", label: "Quote" },
  { v: "image", label: "Image" },
  { v: "split", label: "Image + Text" },
  { v: "divider", label: "Divider" },
];

const PLACEHOLDER: Record<AboutKind, string> = {
  heading: "Heading text…  (**bold**, *italic*)",
  paragraph: "Write a paragraph…  (**bold**, *italic*)",
  list: "One point per line…\nEach line becomes a bullet",
  quote: "A quote…",
  split: "Text that sits beside the image…",
  image: "",
  divider: "",
};

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg ring-1 ring-maple/20">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-2.5 py-1 text-xs font-semibold transition ${
            value === o.v
              ? "bg-coral text-white"
              : "bg-white/70 text-bark/70 hover:bg-peach/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AboutBlockEditor({
  block,
  index,
  count,
  selected,
  innerRef,
  onChange,
  onDelete,
  onMove,
}: {
  block: DraftBlock;
  index: number;
  count: number;
  selected?: boolean;
  innerRef?: (el: HTMLDivElement | null) => void;
  onChange: (b: DraftBlock) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const isText = ["heading", "paragraph", "list", "quote", "split"].includes(
    block.kind,
  );
  const hasImage = block.kind === "image" || block.kind === "split";

  function wrap(marker: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const m = marker.length;
    const sel = value.slice(s, e);
    const restore = (a: number, b: number) =>
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(a, b);
      });

    if (sel) {
      const already =
        sel.startsWith(marker) && sel.endsWith(marker) && sel.length >= m * 2;
      if (already) {
        const inner = sel.slice(m, sel.length - m);
        onChange({ ...block, content: value.slice(0, s) + inner + value.slice(e) });
        restore(s, s + inner.length);
      } else {
        onChange({
          ...block,
          content: value.slice(0, s) + marker + sel + marker + value.slice(e),
        });
        restore(s + m, s + m + sel.length);
      }
    } else {
      onChange({ ...block, content: value.slice(0, s) + marker + marker + value.slice(s) });
      restore(s + m, s + m); // caret between the markers
    }
  }

  return (
    <div
      ref={innerRef}
      className={`scroll-mt-24 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 transition ${
        selected ? "ring-2 ring-coral" : "ring-maple/10"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <label className="relative">
          <span className="sr-only">Block type</span>
          <select
            value={block.kind}
            onChange={(e) => {
              const k = e.target.value as AboutKind;
              const next = { ...block, kind: k };
              if (k === "image" || k === "split") {
                if (next.img_pct == null) next.img_pct = k === "split" ? 50 : 60;
                if (next.img_h == null) next.img_h = k === "split" ? 256 : 288;
              }
              onChange(next);
            }}
            className="cursor-pointer appearance-none rounded-md bg-peach/40 py-1 pl-2.5 pr-7 text-xs font-semibold uppercase tracking-widest text-coral/90 outline-none transition hover:bg-peach/60"
          >
            {KIND_OPTIONS.map((o) => (
              <option key={o.v} value={o.v} className="normal-case tracking-normal">
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-coral/60">
            ▾
          </span>
        </label>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
            aria-label="Move up"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 disabled:opacity-30">↑</button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1}
            aria-label="Move down"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 disabled:opacity-30">↓</button>
          <button type="button" onClick={onDelete} aria-label="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-bold text-coral transition hover:bg-coral hover:text-white">×</button>
        </div>
      </div>

      {/* controls */}
      {block.kind !== "divider" && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isText && (
            <>
              <div className="flex gap-1">
                <button type="button" onClick={() => wrap("**")} title="Bold"
                  className="h-7 w-7 rounded-md bg-peach/40 text-sm font-bold transition hover:bg-peach/70">B</button>
                <button type="button" onClick={() => wrap("*")} title="Italic"
                  className="h-7 w-7 rounded-md bg-peach/40 text-sm italic transition hover:bg-peach/70">I</button>
              </div>
              <Seg<FontChoice>
                value={block.font}
                onChange={(v) => onChange({ ...block, font: v })}
                options={(["display", "serif", "sans"] as FontChoice[]).map((f) => ({ v: f, label: FONT_LABEL[f] }))}
              />
              <Seg<TextSize>
                value={block.size}
                onChange={(v) => onChange({ ...block, size: v })}
                options={[
                  { v: "sm", label: "S" },
                  { v: "md", label: "M" },
                  { v: "lg", label: "L" },
                  { v: "xl", label: "XL" },
                ]}
              />
            </>
          )}

          {hasImage && (
            <Seg<ImgWidth>
              value={block.img_width}
              onChange={(v) =>
                onChange({ ...block, img_width: v, img_pct: IMG_PCT_PRESET[v] })
              }
              options={[
                { v: "sm", label: "S" },
                { v: "md", label: "M" },
                { v: "lg", label: "L" },
                { v: "full", label: "Full" },
              ]}
            />
          )}

          {block.kind === "split" && (
            <Seg<"left" | "right">
              value={block.img_side}
              onChange={(v) => onChange({ ...block, img_side: v })}
              options={[
                { v: "left", label: "🖼 ◀" },
                { v: "right", label: "▶ 🖼" },
              ]}
            />
          )}

          <Seg<Align>
            value={block.align}
            onChange={(v) => onChange({ ...block, align: v })}
            options={[
              { v: "left", label: "⇤" },
              { v: "center", label: "↔" },
              { v: "right", label: "⇥" },
            ]}
          />
        </div>
      )}

      {/* image input (image + split) */}
      {hasImage && (
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              type="url"
              value={block.image_url}
              placeholder="Upload, or paste an image URL"
              onChange={(e) => onChange({ ...block, image_url: e.target.value })}
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none transition focus:border-coral"
            />
            <ImageUpload label="Upload" onUploaded={(url) => onChange({ ...block, image_url: url })} />
          </div>
          {block.image_url.trim() && (
            <Thumb src={block.image_url} alt="preview" framed className="h-24 w-full max-w-[10rem]" />
          )}
          <p className="text-[11px] text-ink/40">Tip: drag the image edge in the preview to resize.</p>
        </div>
      )}

      {/* text body (text kinds + split) */}
      {isText && (
        <textarea
          ref={taRef}
          value={block.content}
          placeholder={PLACEHOLDER[block.kind]}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          rows={block.kind === "heading" || block.kind === "quote" ? 2 : 4}
          style={{ textAlign: block.align }}
          className="w-full resize-y rounded-lg border border-black/15 px-3 py-2 leading-relaxed outline-none transition focus:border-coral"
        />
      )}

      {block.kind === "divider" && (
        <p className="text-sm text-ink/40">A decorative leaf divider 🍁</p>
      )}
    </div>
  );
}
