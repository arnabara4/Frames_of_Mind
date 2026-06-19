"use client";

import { useEffect, useMemo, useState } from "react";
import MessageCard, { type Message } from "@/components/MessageCard";

const PER_PAGE = 6;

export default function MessagesInbox({ messages }: { messages: Message[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.first_name, m.last_name, m.email, m.body]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [messages, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const start = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  if (messages.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-maple/30 bg-white/40 px-8 py-16 text-center">
        <p className="text-3xl">🍂</p>
        <p className="mt-3 font-serif text-lg italic text-bark/60">
          No messages yet — the mailbox is quiet for now.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search messages…"
        className="w-full rounded-full border border-maple/20 bg-white/80 px-5 py-2.5 text-sm outline-none transition focus:border-coral md:max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="mt-8 text-bark/50">No messages match that search.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {pageItems.map((m, i) => (
            <MessageCard key={m.id} message={m} index={i} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-bark/70 ring-1 ring-maple/15 transition hover:bg-peach/50 hover:text-coral disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                page === n
                  ? "bg-coral text-white shadow-[var(--shadow-warm)]"
                  : "bg-white/70 text-bark/70 ring-1 ring-maple/15 hover:bg-peach/50 hover:text-coral"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-bark/70 ring-1 ring-maple/15 transition hover:bg-peach/50 hover:text-coral disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
