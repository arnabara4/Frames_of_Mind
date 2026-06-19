import type {
  Align,
  AboutKind,
  FontChoice,
  ImgWidth,
  TextSize,
} from "@/lib/types";
import { ALIGN_CLASS, FONT_CLASS, SIZE_CLASS, IMG_WIDTH_CLASS } from "@/lib/types";
import { renderRich } from "@/lib/format";
import Thumb from "@/components/Thumb";

export interface AboutView {
  kind: AboutKind;
  content: string | null;
  image_url: string | null;
  align: Align;
  font: FontChoice;
  size: TextSize;
  img_width: ImgWidth;
  img_pct: number | null;
  img_h: number | null;
  img_side: "left" | "right";
  text_x?: number;
  text_y?: number;
}

export default function AboutBlockView({
  block,
  index = 0,
}: {
  block: AboutView;
  index?: number;
}) {
  const align = ALIGN_CLASS[block.align];
  const font = FONT_CLASS[block.font];
  const size = SIZE_CLASS[block.size];

  switch (block.kind) {
    case "heading":
      return (
        <h2 className={`${font} ${size} font-bold text-coral ${align}`}>
          {renderRich(block.content) || <span className="text-ink/30">Heading…</span>}
        </h2>
      );

    case "paragraph":
      return (
        <p className={`${font} ${size} whitespace-pre-wrap leading-relaxed text-bark/85 ${align}`}>
          {renderRich(block.content) || <span className="text-ink/30">Paragraph…</span>}
        </p>
      );

    case "list": {
      const items = (block.content ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const justify =
        block.align === "center" ? "items-center" : block.align === "right" ? "items-end" : "items-start";
      return (
        <ul className={`flex flex-col gap-2 ${justify}`}>
          {items.length === 0 ? (
            <li className="text-ink/30">List item…</li>
          ) : (
            items.map((it, i) => (
              <li key={i} className={`${font} ${size} flex gap-2 leading-relaxed text-bark/85`}>
                <span className="mt-1 text-coral">🍂</span>
                <span>{renderRich(it)}</span>
              </li>
            ))
          )}
        </ul>
      );
    }

    case "quote":
      return (
        <blockquote className={`${font} ${size} border-l-4 border-coral pl-6 italic text-bark ${align}`}>
          {renderRich(block.content) || <span className="text-ink/30">Quote…</span>}
        </blockquote>
      );

    case "image": {
      const justify =
        block.align === "left" ? "justify-start" : block.align === "right" ? "justify-end" : "justify-center";
      const w = block.img_pct ? `${block.img_pct}%` : undefined;
      return (
        <div className={`flex w-full ${justify}`}>
          <div
            style={{ width: w, maxWidth: "100%" }}
            className={w ? "" : `w-full ${IMG_WIDTH_CLASS[block.img_width]}`}
          >
            <Thumb src={block.image_url} alt="About image" seed={index} framed natural className="w-full" />
          </div>
        </div>
      );
    }

    case "split": {
      const pct = block.img_pct ?? 50;
      const img = (
        <div style={{ flexBasis: `${pct}%`, maxWidth: "100%" }} className="min-w-0 shrink-0 self-start">
          <Thumb src={block.image_url} alt="About image" seed={index} framed natural className="w-full" />
        </div>
      );
      const text = (
        <div
          style={{ transform: `translate(${block.text_x ?? 0}px, ${block.text_y ?? 0}px)` }}
          className={`min-w-0 flex-1 self-center whitespace-pre-wrap leading-relaxed text-bark/85 ${font} ${size} ${align}`}
        >
          {renderRich(block.content) || (
            <span className="text-ink/30">Text beside the image…</span>
          )}
        </div>
      );
      return (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
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
      );
    }

    case "divider":
      return (
        <div className="flex items-center justify-center gap-3 py-2 text-maple/50">
          <span className="h-px w-16 bg-maple/30" />
          🍁
          <span className="h-px w-16 bg-maple/30" />
        </div>
      );

    default:
      return null;
  }
}
