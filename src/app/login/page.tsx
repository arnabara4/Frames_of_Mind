"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-4xl font-extrabold text-coral">
        Owner Log-In
      </h1>
      <p className="mt-2 text-ink/60">Sign in to write and manage blogs.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-4 py-2.5 outline-none focus:border-coral"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/15 px-4 py-2.5 outline-none focus:border-coral"
          />
        </label>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-coral px-6 py-3 font-medium text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Log In"}
        </button>
      </form>
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
