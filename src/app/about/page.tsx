import { createClient } from "@/lib/supabase/server";
import type { AboutBlock } from "@/lib/types";
import AboutBlockView from "@/components/AboutBlockView";
import OwnerEditLink from "@/components/OwnerEditLink";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";
export const metadata = { title: "About — Frames of Mind" };

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("about_blocks")
    .select("*")
    .order("position", { ascending: true });

  const blocks = (data ?? []) as AboutBlock[];

  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1000px] px-6 py-12 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-serif text-sm italic text-maple/70">
            a little about the keeper of these words
          </p>
          <OwnerEditLink href="/about/edit" label="Edit page" />
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-peach/50 to-salmon/25 p-8 ring-1 ring-maple/10 md:p-12">
          {blocks.length === 0 ? (
            <p className="text-center text-bark/50">
              This page hasn&apos;t been written yet.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {blocks.map((b, i) => (
                <Reveal key={b.id} delay={Math.min(i * 0.05, 0.3)}>
                  <AboutBlockView block={b} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
