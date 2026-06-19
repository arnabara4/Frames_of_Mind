"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/types";

export interface Message {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  body: string | null;
  created_at: string;
}

const GRADS = [
  "from-coral to-maple",
  "from-amber to-coral",
  "from-maple to-rust",
  "from-gold to-coral",
];

export default function MessageCard({
  message,
  index = 0,
}: {
  message: Message;
  index?: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);

  const name =
    [message.first_name, message.last_name].filter(Boolean).join(" ") ||
    "Anonymous";
  const initial = (message.first_name?.[0] ?? "?").toUpperCase();
  const grad = GRADS[index % GRADS.length];

  async function del() {
    setBusy(true);
    const { error } = await supabase.from("messages").delete().eq("id", message.id);
    if (error) {
      setBusy(false);
      return;
    }
    setGone(true);
    router.refresh();
  }

  if (gone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-maple/15 bg-gradient-to-br from-white via-cream/40 to-peach/25 p-5 shadow-sm transition hover:shadow-[var(--shadow-warm)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${grad} font-display text-lg font-bold text-white shadow-sm`}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-ink">{name}</p>
          {message.email && (
            <a
              href={`mailto:${message.email}`}
              className="block truncate text-sm text-coral hover:underline"
            >
              {message.email}
            </a>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-bark/55 ring-1 ring-maple/15">
          {formatDate(message.created_at)}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap border-l-2 border-coral/30 pl-4 text-bark/80">
        {message.body}
      </p>

      <div className="mt-5 flex items-center justify-end gap-3">
        {message.email && (
          <a
            href={`mailto:${message.email}?subject=Re: your note on Frames of Mind`}
            className="rounded-full border border-coral/40 px-4 py-1.5 text-sm font-semibold text-coral transition hover:bg-coral hover:text-white"
          >
            ✉ Reply
          </a>
        )}
        {confirming ? (
          <span className="flex items-center gap-2 text-sm">
            <button
              onClick={del}
              disabled={busy}
              className="rounded-full bg-coral px-4 py-1.5 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Confirm"}
            </button>
            <button onClick={() => setConfirming(false)} className="text-ink/50 hover:text-ink">
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-ink/50 transition hover:border-coral hover:text-coral"
          >
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}
