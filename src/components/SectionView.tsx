import type { Align, SectionKind } from "@/lib/types";
import { ALIGN_CLASS } from "@/lib/types";
import { renderRich } from "@/lib/format";
import Thumb from "@/components/Thumb";

export interface ViewSection {
  kind: SectionKind;
  content: string | null;
  image_url: string | null;
  align: Align;
}

/**
 * Pure renderer for one blog section. Used both by the live editor preview and
 * the published detail page, so the preview is faithful.
 */
export default function SectionView({
  section,
  index = 0,
  compact = false,
}: {
  section: ViewSection;
  index?: number;
  compact?: boolean;
}) {
  const align = ALIGN_CLASS[section.align ?? "left"];

  switch (section.kind) {
    case "title":
      return (
        <h2
          className={`font-display font-bold text-ink ${align} ${
            compact ? "text-2xl" : "text-3xl md:text-4xl"
          }`}
        >
          {renderRich(section.content) || (
            <span className="text-ink/30">Section title…</span>
          )}
        </h2>
      );

    case "quote": {
      // Border hugs the side the text is aligned to.
      const border =
        section.align === "right"
          ? "border-r-4 pr-6"
          : section.align === "center"
            ? "border-y-2 py-3"
            : "border-l-4 pl-6";
      return (
        <blockquote
          className={`border-coral font-serif italic leading-relaxed text-bark ${border} ${align} ${
            compact ? "text-lg" : "text-xl md:text-2xl"
          }`}
        >
          {renderRich(section.content) || (
            <span className="text-ink/30">Enter a quote…</span>
          )}
        </blockquote>
      );
    }

    case "paragraph":
      return (
        <p
          className={`prose-fom mx-auto whitespace-pre-wrap ${align} ${
            compact ? "text-base leading-relaxed" : ""
          }`}
        >
          {renderRich(section.content) || (
            <span className="text-ink/30">Your paragraph…</span>
          )}
        </p>
      );

    case "image":
      return (
        <div
          className={`flex ${
            section.align === "left"
              ? "justify-start"
              : section.align === "right"
                ? "justify-end"
                : "justify-center"
          }`}
        >
          <Thumb
            src={section.image_url || section.content}
            alt="Blog image"
            seed={index}
            framed
            className={compact ? "h-44 w-full max-w-md" : "h-80 w-full max-w-2xl"}
          />
        </div>
      );

    default:
      return null;
  }
}
