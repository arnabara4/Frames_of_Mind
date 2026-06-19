"use client";

import type { SectionKind } from "@/lib/types";

export interface DraftSection {
  kind: SectionKind;
  content: string;
  image_url: string;
}

const PLACEHOLDERS: Record<SectionKind, string> = {
  title: "Section title…",
  paragraph: "Enter Paragraph…",
  quote: "Enter a quote…",
  image: "Paste an image URL…",
};

/** One editable block in the blog editor, with reorder + delete controls. */
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
  return (
    <div className="group relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md hover:ring-coral/20">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-coral/80">
          {section.kind}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 hover:text-ink disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-peach/50 hover:text-ink disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete section"
            title="Delete section"
            className="flex h-7 w-7 items-center justify-center rounded-full font-display text-lg font-bold text-coral transition hover:bg-coral hover:text-white active:scale-90"
          >
            ×
          </button>
        </div>
      </div>

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
          value={section.content}
          placeholder={PLACEHOLDERS[section.kind]}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          rows={section.kind === "paragraph" ? 4 : 2}
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
