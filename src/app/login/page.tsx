"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import LottiePlayer from "@/components/LottiePlayer";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 overflow-hidden rounded-[32px] border border-maple/15 bg-white/80 shadow-[var(--shadow-warm)] backdrop-blur md:grid-cols-2"
      >
        {/* Decorative panel with the teapot */}
        <div className="relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-peach/70 via-cream/40 to-salmon/40 p-8 text-center md:p-10">
          <LottiePlayer
            src="/lottifiles/teapot.lottie"
            loop
            autoplay
            aria-hidden
            className="h-52 w-52 md:h-60 md:w-60"
          />
          <h2 className="font-display text-2xl font-bold text-coral">
            Welcome back
          </h2>
          <p className="max-w-xs font-serif text-sm italic leading-relaxed text-bark/75">
            The kettle&apos;s on. Sign in to tend your words and stories.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-maple/70">
            Owner access
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-bark">
            Log in
          </h1>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-maple/70">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-maple/20 bg-cream/40 px-4 py-2.5 outline-none transition focus:border-coral focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-maple/70">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-maple/20 bg-cream/40 px-4 py-2.5 outline-none transition focus:border-coral focus:bg-white"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={busy}
              whileTap={{ scale: 0.97 }}
              className="mt-1 rounded-full bg-coral px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Log In 🍂"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 py-20 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
