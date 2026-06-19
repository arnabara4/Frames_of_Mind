import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Blog } from "@/lib/types";
import { BlogRow } from "@/components/BlogCard";
import HomeGreeting from "@/components/HomeGreeting";
import FloatFrame from "@/components/FloatFrame";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/motion";
import { mergeHome } from "@/lib/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data }, { data: homeRow }] = await Promise.all([
    supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("home_content").select("data").eq("key", "home").maybeSingle(),
  ]);

  const blogs = (data ?? []) as Blog[];
  const c = mergeHome(homeRow?.data);

  return (
    <div id="top">
      {/* ───────────────── Hero ───────────────── */}
      <section className="relative overflow-hidden">
        {/* faint oversized seasonal word behind the hero */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 top-24 select-none font-script text-[20vw] font-bold leading-none text-coral/[0.06] md:top-16"
        >
          {c.bgWord}
        </span>

        <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-6 pt-14 md:grid-cols-[1.05fr_1fr] md:gap-6 md:px-10 md:pt-20">
          {/* Left — words */}
          <div className="flex flex-col gap-6">
            <Reveal>
              <span className="inline-flex w-fit items-center gap-2 font-script text-lg italic text-maple/80 md:text-xl">
                <span aria-hidden className="text-xl not-italic text-coral">
                  ❦
                </span>
                {c.kicker}
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-5xl font-extrabold leading-[1.02] text-bark md:text-7xl">
                {c.title}
                <br />
                <span className="italic text-coral">{c.accent}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="max-w-md font-serif text-lg italic leading-relaxed text-bark/75 md:text-xl">
                {c.subline}
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-warm)] transition hover:-translate-y-0.5 hover:bg-coral-dark active:scale-95"
                >
                  {c.ctaPrimary} <span className="text-base">🍁</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-coral/40 bg-white/60 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-coral transition hover:bg-white active:scale-95"
                >
                  {c.ctaSecondary}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — scrapbook of frames */}
          <Reveal delay={0.12}>
            <div className="relative mx-auto h-[420px] w-full max-w-[520px] md:h-[560px]">
              <FloatFrame
                seed={0}
                ornate
                src={c.frames[0].image_url}
                caption={c.frames[0].caption}
                rotate={-3}
                delay={0}
                floatRange={12}
                aspect="aspect-[4/5]"
                className="absolute left-[4%] top-[4%] w-[58%]"
              />
              <FloatFrame
                seed={2}
                ornate
                src={c.frames[1].image_url}
                caption={c.frames[1].caption}
                rotate={6}
                delay={1.1}
                floatRange={9}
                aspect="aspect-square"
                className="absolute bottom-[6%] right-[2%] w-[46%]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── Featured pull-quote ───────────────── */}
      <section className="mx-auto max-w-[1440px] px-6 pt-20 md:px-10">
        <Reveal>
          <figure className="relative mx-auto max-w-4xl overflow-hidden rounded-[36px] border border-maple/15 bg-gradient-to-br from-peach/50 via-cream/40 to-salmon/30 px-8 py-14 text-center shadow-[var(--shadow-warm)] md:px-16 md:py-20">
            <span
              aria-hidden
              className="pointer-events-none absolute left-6 top-2 select-none font-display text-[9rem] leading-none text-coral/15 md:text-[12rem]"
            >
              &ldquo;
            </span>
            <blockquote className="relative font-display text-2xl font-medium italic leading-snug text-bark md:text-4xl">
              {c.quote}
            </blockquote>
            <figcaption className="mt-6 font-serif text-sm italic text-maple/70">
              {c.quoteCaption}
            </figcaption>
            <span className="absolute bottom-6 right-8 text-3xl opacity-70">
              🍁
            </span>
          </figure>
        </Reveal>
      </section>

      {/* ───────────────── Moments gallery ───────────────── */}
      <section className="mx-auto max-w-[1440px] px-6 pt-20 md:px-10">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-maple/60">
              a few moments
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-bark md:text-4xl">
              Pressed between the pages
            </h2>
          </div>
        </Reveal>
        <StaggerGrid className="mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-8">
          {[
            { r: -4, a: "aspect-[4/5]" },
            { r: 3, a: "aspect-square" },
            { r: -3, a: "aspect-[4/5]" },
          ].map((g, i) => (
            <StaggerItem key={i}>
              <FloatFrame
                seed={i + 1}
                src={c.gallery[i].image_url}
                caption={c.gallery[i].caption}
                rotate={g.r}
                delay={i * 0.4}
                floatRange={8}
                aspect={g.a}
                className="w-52 md:w-60"
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      {/* Auth CTA */}
      <section className="mx-auto mt-20 flex max-w-[1440px] justify-center px-6 md:px-10">
        <HomeGreeting />
      </section>

      {/* ───────────────── Recent Blogs ───────────────── */}
      <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-24 md:px-10">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 border-b border-maple/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-maple/60">
                latest from the journal
              </p>
              <h2 className="mt-2 font-display text-4xl font-extrabold text-bark md:text-5xl">
                Recent Blogs
              </h2>
            </div>
            <Link
              href="/blogs"
              className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-coral transition"
            >
              Read all entries
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>

        <StaggerGrid className="mt-10 flex flex-col gap-6">
          {blogs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-maple/30 bg-white/40 px-8 py-16 text-center">
              <p className="text-3xl">🍂</p>
              <p className="mt-3 font-serif text-lg italic text-bark/60">
                The first leaves haven&apos;t fallen yet — new stories are on
                their way.
              </p>
            </div>
          ) : (
            blogs.map((b, i) => (
              <StaggerItem key={b.id} lift={false}>
                <div className="group flex items-stretch gap-4 md:gap-6">
                  {/* index marker */}
                  <div className="hidden flex-col items-center pt-6 md:flex">
                    <span className="font-display text-2xl font-bold text-coral/40 transition-colors group-hover:text-coral">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 w-px flex-1 bg-gradient-to-b from-maple/30 to-transparent" />
                  </div>
                  <div className="flex-1">
                    <BlogRow blog={b} seed={i} />
                  </div>
                </div>
              </StaggerItem>
            ))
          )}
        </StaggerGrid>
      </section>
    </div>
  );
}
