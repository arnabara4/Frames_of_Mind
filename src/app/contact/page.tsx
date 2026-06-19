"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    body: "",
  });
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Email verification (OTP) state
  const [otpStage, setOtpStage] = useState<"idle" | "sent" | "verified">("idle");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Changing the email invalidates any prior verification.
  const onEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, email: e.target.value }));
    setOtpStage("idle");
    setToken(null);
    setCode("");
    setOtpMsg(null);
  };

  async function sendCode() {
    setOtpBusy(true);
    setOtpMsg(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setOtpMsg(data.error ?? "Couldn't send a code.");
      } else {
        setOtpStage("sent");
        setOtpMsg("Code sent — check your inbox.");
      }
    } catch {
      setOtpMsg("Network error — try again.");
    }
    setOtpBusy(false);
  }

  async function confirmCode() {
    setOtpBusy(true);
    setOtpMsg(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setOtpMsg(data.error ?? "Invalid code.");
      } else {
        setToken(data.token);
        setOtpStage("verified");
        setOtpMsg(null);
      }
    } catch {
      setOtpMsg("Network error — try again.");
    }
    setOtpBusy(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setError("Please verify your email first.");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, website, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Could not send — try again.");
        return;
      }
      setStatus("sent");
      setForm({ first_name: "", last_name: "", email: "", body: "" });
      setOtpStage("idle");
      setToken(null);
      setCode("");
    } catch {
      setStatus("error");
      setError("Network error — please try again.");
    }
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
              <span className="text-sm">
                Use the form — it reaches me directly.
              </span>
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
                {/* Honeypot — hidden from humans, catches bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  aria-hidden
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
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
                <div>
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={onEmail}
                    placeholder="you@example.com"
                  />

                  {/* Email verification (OTP) */}
                  <div className="mt-2">
                    {otpStage === "verified" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                        ✓ Email verified
                      </span>
                    ) : otpStage === "sent" ? (
                      <div className="flex flex-col gap-2 rounded-xl border border-maple/20 bg-cream/40 p-3">
                        <p className="text-xs text-bark/60">
                          Enter the 6-digit code sent to{" "}
                          <span className="font-semibold">{form.email}</span>.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) =>
                              setCode(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="123456"
                            className="w-32 rounded-lg border border-maple/20 bg-white px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-coral"
                          />
                          <button
                            type="button"
                            onClick={confirmCode}
                            disabled={otpBusy || code.length < 6}
                            className="rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white transition hover:bg-coral-dark active:scale-95 disabled:opacity-50"
                          >
                            {otpBusy ? "Checking…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={sendCode}
                            disabled={otpBusy}
                            className="text-xs font-medium text-coral hover:underline"
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={sendCode}
                        disabled={!emailValid || otpBusy}
                        className="rounded-full border border-coral/40 px-4 py-1.5 text-sm font-semibold text-coral transition hover:bg-coral hover:text-white active:scale-95 disabled:opacity-50"
                      >
                        {otpBusy ? "Sending…" : "✉ Verify email to send"}
                      </button>
                    )}
                    {otpMsg && (
                      <p className="mt-1.5 text-xs text-bark/60">{otpMsg}</p>
                    )}
                  </div>
                </div>

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
                  disabled={status === "sending" || !token}
                  whileTap={{ scale: 0.97 }}
                  title={!token ? "Verify your email first" : undefined}
                  className="mt-1 inline-flex items-center justify-center gap-2 self-start rounded-full bg-coral px-9 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark disabled:opacity-50"
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
