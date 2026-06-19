import { createClient } from "@/lib/supabase/server";
import type { Blog } from "@/lib/types";
import Thumb from "@/components/Thumb";
import { BlogRow } from "@/components/BlogCard";
import HomeGreeting from "@/components/HomeGreeting";

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
    <div id="top" className="mx-auto max-w-[1440px] px-6 md:px-10">
      {/* Hero */}
      <section className="grid grid-cols-1 gap-10 pt-10 md:grid-cols-2 md:pt-16">
        <Thumb
          alt="Frames of Mind hero"
          seed={0}
          className="aspect-square w-full rounded-3xl"
        />
        <div className="flex flex-col justify-center gap-8">
          <h1 className="font-display text-4xl font-extrabold text-coral md:text-6xl">
            MY THOUGHTS
          </h1>
          <Thumb
            alt="Featured"
            seed={1}
            className="h-64 w-full rounded-2xl md:h-80"
          />
          <p className="font-serif text-xl italic leading-relaxed text-ink/80 md:text-2xl">
            “Never stop fighting until you arrive at your destined place — that
            is, the unique you.”
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Thumb
            key={i}
            alt={`Gallery ${i + 1}`}
            seed={i + 1}
            className="h-72 w-full rounded-2xl"
          />
        ))}
      </section>

      {/* Auth CTA */}
      <section className="mt-14 flex justify-center">
        <HomeGreeting />
      </section>

      {/* Recent Blogs */}
      <section className="mt-16 pb-10">
        <h2 className="font-display text-3xl font-extrabold text-ink md:text-5xl">
          Recent Blogs
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          {blogs.length === 0 ? (
            <p className="text-ink/50">No blogs yet — check back soon.</p>
          ) : (
            blogs.map((b, i) => <BlogRow key={b.id} blog={b} seed={i} />)
          )}
        </div>
      </section>
    </div>
  );
}
