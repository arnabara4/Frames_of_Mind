"use client";

import { useRef } from "react";
import type {
  Align,
  AboutKind,
  FontChoice,
  ImgWidth,
  TextSize,
} from "@/lib/types";
import { FONT_LABEL } from "@/lib/types";
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
}

const PLACEHOLDER: Record<AboutKind, string> = {
  heading: "Heading text…  (**bold**, *italic*)",
  paragraph: "Write a paragraph…  (**bold**, *italic*)",
  list: "One point per line…\nEach line becomes a bullet",
  quote: "A quote…",
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
  onChange,
  onDelete,
  onMove,
}: {
  block: DraftBlock;
  index: number;
  count: number;
  onChange: (b: DraftBlock) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const isText = ["heading", "paragraph", "list", "quote"].includes(block.kind);

  function wrap(marker: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || "text";
    onChange({
      ...block,
      content: value.slice(0, s) + marker + sel + marker + value.slice(e),
    });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + marker.length, s + marker.length + sel.length);
    });
  }

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-maple/10">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-coral/80">
          {block.kind}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-bold text-coral transition hover:bg-coral hover:text-white"
          >
            ×
          </button>
        </div>
      </div>

      {/* controls */}
      {block.kind !== "divider" && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isText && (
            <>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => wrap("**")}
                  className="h-7 w-7 rounded-md bg-peach/40 text-sm font-bold transition hover:bg-peach/70"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => wrap("*")}
                  className="h-7 w-7 rounded-md bg-peach/40 text-sm italic transition hover:bg-peach/70"
                  title="Italic"
                >
                  I
                </button>
              </div>
              <Seg<FontChoice>
                value={block.font}
                onChange={(v) => onChange({ ...block, font: v })}
                options={(["display", "serif", "sans"] as FontChoice[]).map(
                  (f) => ({ v: f, label: FONT_LABEL[f] }),
                )}
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

          {block.kind === "image" && (
            <Seg<ImgWidth>
              value={block.img_width}
              onChange={(v) => onChange({ ...block, img_width: v })}
              options={[
                { v: "sm", label: "S" },
                { v: "md", label: "M" },
                { v: "lg", label: "L" },
                { v: "full", label: "Full" },
              ]}
            />
          )}

          {/* alignment for text + image */}
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

      {/* body */}
      {block.kind === "image" ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              type="url"
              value={block.image_url}
              placeholder="Upload, or paste an image URL"
              onChange={(e) => onChange({ ...block, image_url: e.target.value })}
              className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none transition focus:border-coral"
            />
            <ImageUpload
              label="Upload"
              onUploaded={(url) => onChange({ ...block, image_url: url })}
            />
          </div>
          {block.image_url.trim() && (
            <Thumb
              src={block.image_url}
              alt="preview"
              framed
              className="h-32 w-full max-w-xs"
            />
          )}
        </div>
      ) : block.kind === "divider" ? (
        <p className="text-sm text-ink/40">A decorative leaf divider 🍁</p>
      ) : (
        <textarea
          ref={taRef}
          value={block.content}
          placeholder={PLACEHOLDER[block.kind]}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          rows={block.kind === "paragraph" || block.kind === "list" ? 4 : 2}
          style={{ textAlign: block.align }}
          className="w-full resize-y rounded-lg border border-black/15 px-3 py-2 leading-relaxed outline-none transition focus:border-coral"
        />
      )}
    </div>
  );
}
