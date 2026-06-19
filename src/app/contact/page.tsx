"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    body: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const { error } = await supabase.from("messages").insert(form);
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
    setForm({ first_name: "", last_name: "", email: "", body: "" });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14 md:px-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_7fr]">
        {/* ── Invitation panel ── */}
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-maple/15 bg-gradient-to-br from-peach/70 via-cream/50 to-salmon/40 p-8 shadow-[var(--shadow-warm)] md:p-10"
        >
          <motion.span
            aria-hidden
            className="absolute right-6 top-6 text-4xl"
            animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            🍂
          </motion.span>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-maple/70">
            Say hello
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-coral md:text-5xl">
            Let&apos;s share a few autumn words
          </h1>
          <p className="mt-5 max-w-sm font-serif text-lg italic leading-relaxed text-bark/80">
            Whether it&apos;s a thought, a story, or simply a hello — drop a
            line. Every message is read like a letter on a quiet October
            evening.
          </p>

          <div className="mt-8 h-px w-full bg-maple/20" />

          <ul className="mt-6 space-y-3 text-bark/80">
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-coral">
                ✉
              </span>
              <a
                href="mailto:pranavisinghal2007@gmail.com"
                className="transition hover:text-coral"
              >
                pranavisinghal2007@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/70 text-coral">
                🍁
              </span>
              <span className="text-sm">Replies within a few autumn days.</span>
            </li>
          </ul>

          <p className="mt-10 font-script text-2xl text-coral/80">
            — Pranavi
          </p>
        </motion.aside>

        {/* ── Form card ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[32px] border border-maple/15 bg-white/85 p-8 shadow-sm backdrop-blur md:p-10"
        >
          <AnimatePresence mode="wait">
            {status === "sent" ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-coral to-maple text-3xl text-white shadow-[var(--shadow-warm)]"
                >
                  🍂
                </motion.div>
                <h2 className="mt-6 font-display text-3xl font-bold text-coral">
                  Your words have landed
                </h2>
                <p className="mt-2 max-w-xs font-serif italic text-bark/70">
                  Thank you for writing. I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 rounded-full border border-coral/40 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-coral transition hover:bg-coral hover:text-white active:scale-95"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="First Name"
                    required
                    value={form.first_name}
                    onChange={set("first_name")}
                    placeholder="Pranavi"
                  />
                  <Field
                    label="Last Name"
                    value={form.last_name}
                    onChange={set("last_name")}
                    placeholder="Singhal"
                  />
                </div>
                <Field
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                />
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-widest text-maple/70">
                    Message
                  </span>
                  <textarea
                    required
                    value={form.body}
                    onChange={set("body")}
                    rows={6}
                    placeholder="Pour your thoughts here…"
                    className="mt-2 w-full resize-y rounded-2xl border border-maple/20 bg-cream/40 px-4 py-3 leading-relaxed outline-none transition placeholder:text-bark/30 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/25"
                  />
                </label>

                {status === "error" && (
                  <p className="rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={status === "sending"}
                  whileTap={{ scale: 0.97 }}
                  className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-full bg-coral px-9 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark disabled:opacity-60"
                >
                  {status === "sending" ? (
                    "Sending…"
                  ) : (
                    <>
                      Send message <span className="text-base">🍃</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-maple/70">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-maple/20 bg-cream/40 px-4 py-3 outline-none transition placeholder:text-bark/30 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/25"
      />
    </label>
  );
}
