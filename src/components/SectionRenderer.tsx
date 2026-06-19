import type { BlogSection } from "@/lib/types";
import Thumb from "@/components/Thumb";

/** Renders one stored blog section on the detail page. */
export default function SectionRenderer({
  section,
  index,
}: {
  section: BlogSection;
  index: number;
}) {
  switch (section.kind) {
    case "title":
      return (
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">
            {section.content}
          </h2>
        </div>
      );

    case "quote":
      return (
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <blockquote className="border-l-4 border-coral pl-5 font-serif text-xl italic text-ink/80">
            {section.content}
          </blockquote>
        </div>
      );

    case "paragraph":
      return (
        <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink/80">
            {section.content}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="flex justify-center">
          <Thumb
            src={section.image_url || section.content}
            alt="Blog image"
            seed={index}
            className="h-80 w-full max-w-xl rounded-2xl"
          />
        </div>
      );

    default:
      return null;
  }
}
