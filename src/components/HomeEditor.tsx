"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import ImageUpload from "@/components/ImageUpload";
import Thumb from "@/components/Thumb";
import { mergeHome, type FrameItem, type HomeContent } from "@/lib/home";

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-maple/70">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-y rounded-xl border border-maple/20 bg-cream/40 px-4 py-2.5 leading-relaxed outline-none transition focus:border-coral focus:bg-white"
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-maple/20 bg-cream/40 px-4 py-2.5 outline-none transition focus:border-coral focus:bg-white"
        />
      )}
    </label>
  );
}

function FrameField({
  label,
  item,
  onChange,
}: {
  label: string;
  item: FrameItem;
  onChange: (f: FrameItem) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-maple/15 bg-white/70 p-4 sm:flex-row sm:items-start">
      <Thumb src={item.image_url} alt="" framed className="h-24 w-24 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-maple/60">
          {label}
        </span>
        <input
          value={item.caption}
          placeholder="Caption"
          onChange={(e) => onChange({ ...item, caption: e.target.value })}
          className="w-full rounded-lg border border-maple/20 bg-cream/40 px-3 py-2 text-sm outline-none focus:border-coral focus:bg-white"
        />
        <input
          value={item.image_url}
          placeholder="Image URL (or upload)"
          onChange={(e) => onChange({ ...item, image_url: e.target.value })}
          className="w-full rounded-lg border border-maple/20 bg-cream/40 px-3 py-2 text-sm outline-none focus:border-coral focus:bg-white"
        />
        <div className="flex flex-wrap items-center gap-2">
          <ImageUpload label="Upload" onUploaded={(url) => onChange({ ...item, image_url: url })} />
          {item.image_url && (
            <button
              type="button"
              onClick={() => onChange({ ...item, image_url: "" })}
              className="text-xs font-medium text-ink/50 hover:text-coral"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeEditor({
  initial,
}: {
  initial: Partial<HomeContent> | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { loading, owner } = useAuth();
  const [c, setC] = useState<HomeContent>(mergeHome(initial));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !owner) router.replace("/");
  }, [loading, owner, router]);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2600);
    return () => clearTimeout(t);
  }, [saved]);

  const set = (k: keyof HomeContent, v: unknown) =>
    setC((prev) => ({ ...prev, [k]: v }));
  const setFrame = (key: "frames" | "gallery", i: number, f: FrameItem) =>
    setC((prev) => ({
      ...prev,
      [key]: prev[key].map((x, idx) => (idx === i ? f : x)),
    }));

  async function save() {
    setError(null);
    setSaving(true);
    const { error: err } = await supabase
      .from("home_content")
      .update({ data: c, updated_at: new Date().toISOString() })
      .eq("key", "home");
    setSaving(false);
    if (err) return setError(err.message);
    setSaved(true);
    router.refresh();
  }

  if (loading || !owner) {
    return <div className="px-6 py-24 text-center text-ink/50">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-maple/20 bg-white/60 px-4 py-1.5 text-sm font-medium text-bark/70 transition hover:-translate-x-0.5 hover:border-coral hover:text-coral"
        >
          ← Back to dashboard
        </Link>
        <span className="text-sm uppercase tracking-[0.25em] text-coral/70">
          Editing the Home page
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold text-coral">Home content</h1>

      <div className="mt-6 flex flex-col gap-8">
        <Section title="Hero">
          <Field label="Kicker" value={c.kicker} onChange={(v) => set("kicker", v)} />
          <Field label="Headline" value={c.title} onChange={(v) => set("title", v)} />
          <Field label="Accent line (coral)" value={c.accent} onChange={(v) => set("accent", v)} />
          <Field label="Subline" textarea value={c.subline} onChange={(v) => set("subline", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary button" value={c.ctaPrimary} onChange={(v) => set("ctaPrimary", v)} />
            <Field label="Secondary button" value={c.ctaSecondary} onChange={(v) => set("ctaSecondary", v)} />
          </div>
          <Field label="Background word" value={c.bgWord} onChange={(v) => set("bgWord", v)} />
        </Section>

        <Section title="Hero frames">
          <div className="flex flex-col gap-3">
            {c.frames.map((f, i) => (
              <FrameField
                key={i}
                label={`Frame ${i + 1}`}
                item={f}
                onChange={(nf) => setFrame("frames", i, nf)}
              />
            ))}
          </div>
        </Section>

        <Section title="Featured quote">
          <Field label="Quote" textarea value={c.quote} onChange={(v) => set("quote", v)} />
          <Field label="Quote caption" value={c.quoteCaption} onChange={(v) => set("quoteCaption", v)} />
        </Section>

        <Section title="Moments gallery">
          <div className="flex flex-col gap-3">
            {c.gallery.map((f, i) => (
              <FrameField
                key={i}
                label={`Moment ${i + 1}`}
                item={f}
                onChange={(nf) => setFrame("gallery", i, nf)}
              />
            ))}
          </div>
        </Section>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">{error}</p>
      )}

      <div className="sticky bottom-5 z-30 mt-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full border border-maple/15 bg-cream/90 px-3 py-2.5 pl-6 shadow-[0_20px_50px_-20px_rgba(156,52,21,0.6)] backdrop-blur-md">
          <span className="flex items-center gap-2 text-sm text-bark/70">
            <span className="text-lg">🍂</span>
            <span className="hidden font-serif italic sm:inline">
              shaping your landing page
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-bark/60 transition hover:text-bark"
            >
              View home
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : "✓ Save Home"}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-gradient-to-br from-coral to-maple px-6 py-3 text-white shadow-[0_20px_50px_-15px_rgba(156,52,21,0.7)]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-sm">✓</span>
              <span className="text-sm font-semibold">Home saved 🍂</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-maple/12 bg-gradient-to-br from-peach/30 to-cream/40 p-5">
      <h2 className="mb-4 font-display text-xl font-bold text-bark">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
