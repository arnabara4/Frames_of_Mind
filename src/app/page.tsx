import { createClient } from "@/lib/supabase/server";
import type { Blog } from "@/lib/types";
import Thumb from "@/components/Thumb";
import { BlogRow } from "@/components/BlogCard";
import HomeGreeting from "@/components/HomeGreeting";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const blogs = (data ?? []) as Blog[];

  return (
    <div id="top">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 pt-12 md:grid-cols-2 md:px-10 md:pt-20">
          <Reveal>
            <Thumb
              alt="Frames of Mind hero"
              seed={0}
              framed
              className="aspect-square w-full"
            />
          </Reveal>
          <div className="flex flex-col justify-center gap-8">
            <Reveal delay={0.1}>
              <h1 className="font-display text-4xl font-extrabold text-coral md:text-6xl">
                MY THOUGHTS
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <Thumb alt="Featured" seed={1} framed className="h-64 w-full md:h-80" />
            </Reveal>
            <Reveal delay={0.3}>
              <p className="font-serif text-xl italic leading-relaxed text-bark md:text-2xl">
                “Never stop fighting until you arrive at your destined place —
                that is, the unique you.”
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10">
        <StaggerGrid className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <StaggerItem key={i}>
              <Thumb alt={`Gallery ${i + 1}`} seed={i + 1} framed className="h-72 w-full" />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* Auth CTA */}
      <section className="mx-auto mt-14 flex max-w-[1440px] justify-center px-6 md:px-10">
        <HomeGreeting />
      </section>

      {/* Recent Blogs */}
      <section className="mx-auto max-w-[1440px] px-6 pb-10 md:px-10">
        <Reveal>
          <h2 className="mt-16 font-display text-3xl font-extrabold text-ink md:text-5xl">
            Recent Blogs
          </h2>
        </Reveal>
        <StaggerGrid className="mt-8 flex flex-col gap-6">
          {blogs.length === 0 ? (
            <p className="text-bark/60">No blogs yet — check back soon.</p>
          ) : (
            blogs.map((b, i) => (
              <StaggerItem key={b.id} lift={false}>
                <BlogRow blog={b} seed={i} />
              </StaggerItem>
            ))
          )}
        </StaggerGrid>
      </section>
    </div>
  );
}
