import type { BlogSection } from "@/lib/types";
import Thumb from "@/components/Thumb";
import { Reveal } from "@/components/motion";

/** Renders one stored blog section on the detail page. */
export default function SectionRenderer({
  section,
  index,
}: {
  section: BlogSection;
  index: number;
}) {
  const body = (() => {
    switch (section.kind) {
      case "title":
        return (
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            {section.content}
          </h2>
        );

      case "quote":
        return (
          <blockquote className="border-l-4 border-coral pl-6 font-serif text-xl italic leading-relaxed text-bark md:text-2xl">
            {section.content}
          </blockquote>
        );

      case "paragraph":
        return (
          <p className="prose-fom mx-auto whitespace-pre-wrap">
            {section.content}
          </p>
        );

      case "image":
        return (
          <div className="flex justify-center">
            <Thumb
              src={section.image_url || section.content}
              alt="Blog image"
              seed={index}
              framed
              className="h-80 w-full max-w-2xl"
            />
          </div>
        );

      default:
        return null;
    }
  })();

  return <Reveal delay={Math.min(index * 0.05, 0.3)}>{body}</Reveal>;
}
