import type { BlogSection } from "@/lib/types";
import SectionView from "@/components/SectionView";
import { Reveal } from "@/components/motion";

/** Renders one stored blog section on the detail page (with scroll reveal). */
export default function SectionRenderer({
  section,
  index,
}: {
  section: BlogSection;
  index: number;
}) {
  return (
    <Reveal delay={Math.min(index * 0.05, 0.3)}>
      <SectionView section={section} index={index} />
    </Reveal>
  );
}
