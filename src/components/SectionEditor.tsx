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

/** One editable block in the new-blog editor. */
export default function SectionEditor({
  section,
  index,
  onChange,
  onDelete,
}: {
  section: DraftSection;
  index: number;
  onChange: (next: DraftSection) => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-coral">
          {section.kind}
        </span>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete section"
          title="Delete section"
          className="flex h-7 w-7 items-center justify-center rounded-full font-display text-lg font-bold text-coral hover:bg-coral hover:text-white"
        >
          D
        </button>
      </div>

      {section.kind === "image" ? (
        <input
          type="url"
          value={section.image_url}
          placeholder={PLACEHOLDERS.image}
          onChange={(e) => onChange({ ...section, image_url: e.target.value })}
          className="w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-coral"
        />
      ) : (
        <textarea
          value={section.content}
          placeholder={PLACEHOLDERS[section.kind]}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          rows={section.kind === "paragraph" ? 4 : 2}
          className={`w-full resize-y rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-coral ${
            section.kind === "title"
              ? "font-display text-2xl font-bold"
              : section.kind === "quote"
                ? "font-serif italic"
                : ""
          }`}
        />
      )}
      <input type="hidden" value={index} readOnly />
    </div>
  );
}
