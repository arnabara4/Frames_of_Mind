"use client";

import { useRef } from "react";
import type { Align, SectionKind } from "@/lib/types";

export interface DraftSection {
  kind: SectionKind;
  content: string;
  image_url: string;
  align: Align;
}

const PLACEHOLDERS: Record<SectionKind, string> = {
  title: "Section title…",
  paragraph: "Write your paragraph…  (**bold**, *italic*)",
  quote: "Enter a quote…",
  image: "Paste an image URL…",
};

const ALIGNS: { value: Align; icon: string; label: string }[] = [
  { value: "left", icon: "⇤", label: "Align left" },
  { value: "center", icon: "↔", label: "Align center" },
  { value: "right", icon: "⇥", label: "Align right" },
];

/** One editable block: format toolbar (bold/italic/align) + reorder + delete. */
export default function SectionEditor({
  section,
  index,
  count,
  onChange,
  onDelete,
  onMove,
}: {
  section: DraftSection;
  index: number;
  count: number;
  onChange: (next: DraftSection) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const isText = section.kind !== "image";

  /** Wrap the current selection (or caret) with a marker like ** or *. */
  function wrap(marker: string) {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || "text";
    const next = value.slice(0, s) + marker + selected + marker + value.slice(e);
    onChange({ ...section, content: next });
    // Restore a sensible selection after React re-renders.
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + marker.length, s + marker.length + selected.length);
    });
  }

  return (
    <div className="group relative rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-maple/10 backdrop-blur transition hover:shadow-md hover:ring-coral/25">
      {/* Top bar: kind + reorder/delete */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-coral/80">
          {section.kind}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn label="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </IconBtn>
          <IconBtn
            label="Move down"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
          >
            ↓
          </IconBtn>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete section"
            title="Delete section"
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-bold text-coral transition hover:bg-coral hover:text-white active:scale-90"
          >
            ×
          </button>
        </div>
      </div>

      {/* Formatting toolbar (text blocks only) */}
      {isText && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <ToolBtn label="Bold" onClick={() => wrap("**")}>
            <span className="font-bold">B</span>
          </ToolBtn>
          <ToolBtn label="Italic" onClick={() => wrap("*")}>
            <span className="italic">I</span>
          </ToolBtn>
          <span className="mx-1 h-5 w-px bg-black/10" />
          {ALIGNS.map((a) => (
            <ToolBtn
              key={a.value}
              label={a.label}
              active={section.align === a.value}
              onClick={() => onChange({ ...section, align: a.value })}
            >
              {a.icon}
            </ToolBtn>
          ))}
        </div>
      )}

      {section.kind === "image" ? (
        <input
          type="url"
          value={section.image_url}
          placeholder={PLACEHOLDERS.image}
          onChange={(e) => onChange({ ...section, image_url: e.target.value })}
          className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none transition focus:border-coral"
        />
      ) : (
        <textarea
          ref={taRef}
          value={section.content}
          placeholder={PLACEHOLDERS[section.kind]}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          rows={section.kind === "paragraph" ? 4 : 2}
          style={{ textAlign: section.align }}
          className={`w-full resize-y rounded-lg border border-black/15 px-3 py-2 outline-none transition focus:border-coral ${
            section.kind === "title"
              ? "font-display text-2xl font-bold"
              : section.kind === "quote"
                ? "font-serif text-lg italic"
                : "leading-relaxed"
          }`}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition active:scale-90 ${
        active
          ? "bg-coral text-white"
          : "bg-peach/30 text-ink hover:bg-peach/60"
      }`}
    >
      {children}
    </button>
  );
}
