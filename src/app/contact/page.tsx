"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    body: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
    <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10">
      <h1 className="font-serif text-4xl font-bold text-coral md:text-6xl">
        LET ME KNOW WHATS ON YOUR MIND
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-3xl bg-salmon/80 p-8 md:p-14"
      >
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2">
          <label className="block">
            <span className="text-xl font-medium text-ink">First Name</span>
            <input
              required
              value={form.first_name}
              onChange={set("first_name")}
              className="input-underline mt-3 text-lg"
            />
          </label>
          <label className="block">
            <span className="text-xl font-medium text-ink">Last Name</span>
            <input
              value={form.last_name}
              onChange={set("last_name")}
              className="input-underline mt-3 text-lg"
            />
          </label>
          <label className="block">
            <span className="text-xl font-medium text-ink">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              className="input-underline mt-3 text-lg"
            />
          </label>
        </div>

        <label className="mt-8 block">
          <span className="text-xl font-medium text-ink">Message</span>
          <textarea
            required
            value={form.body}
            onChange={set("body")}
            rows={5}
            className="mt-3 w-full rounded-2xl bg-peach/70 p-4 text-lg outline-none focus:ring-2 focus:ring-coral"
          />
        </label>

        <div className="mt-8 flex items-center gap-5">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-xl bg-coral px-10 py-3 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          {status === "sent" && (
            <span className="text-ink">Thanks — your message was sent! 🌸</span>
          )}
          {status === "error" && (
            <span className="text-coral-dark">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
