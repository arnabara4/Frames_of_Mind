"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { timeAgo, type Comment } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLS = "id, blog_id, parent_id, author_name, body, created_at";

/* ── Avatar ───────────────────────────────────────────────────────────── */
const AVATAR_BG = ["bg-coral", "bg-maple", "bg-coral-dark", "bg-amber", "bg-[#9c5b2a]"];

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const trimmed = name.trim();
  let h = 0;
  for (let i = 0; i < trimmed.length; i++) h = (h * 31 + trimmed.charCodeAt(i)) >>> 0;
  const bg = AVATAR_BG[h % AVATAR_BG.length];
  // Split by code points ([...w]) so an emoji name never yields a lone UTF-16
  // surrogate (which serializes differently on server vs client → hydration bug).
  const initials = trimmed
    ? trimmed
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => [...w][0]?.toUpperCase() ?? "")
        .join("")
    : "🍁";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 select-none place-items-center rounded-full font-display font-bold text-white shadow-sm ${bg}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </span>
  );
}

/* ── Composer (top-level & replies) ───────────────────────────────────── */
function CommentForm({
  blogId,
  parentId = null,
  initial = "",
  autoFocus = false,
  placeholder = "Add a comment…",
  onPosted,
  onCancel,
}: {
  blogId: string;
  parentId?: string | null;
  initial?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onPosted: (c: Comment) => void;
  onCancel?: () => void;
}) {
  const isReply = parentId !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState(initial);
  const [website, setWebsite] = useState(""); // honeypot
  const [open, setOpen] = useState(isReply || autoFocus);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Remember the commenter locally so they don't retype name/email each time.
  useEffect(() => {
    try {
      setName(localStorage.getItem("fom-comment-name") ?? "");
      setEmail(localStorage.getItem("fom-comment-email") ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  function close() {
    setText("");
    setErrors({});
    setWebsite("");
    if (isReply) onCancel?.();
    else setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please add your name.";
    if (!email.trim()) next.email = "Please add your email.";
    else if (!EMAIL.test(email.trim())) next.email = "That email doesn't look right.";
    if (!text.trim()) next.body = "Write something first.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blog_id: blogId,
          parent_id: parentId,
          name: name.trim(),
          email: email.trim(),
          body: text.trim(),
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrors(
          data.fieldErrors ?? { body: data.error ?? "Could not post — please try again." },
        );
        return;
      }
      try {
        localStorage.setItem("fom-comment-name", name.trim());
        localStorage.setItem("fom-comment-email", email.trim());
      } catch {
        /* ignore */
      }
      if (data.comment) onPosted(data.comment as Comment);
      close();
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-maple/20 bg-white/70 px-3 py-2 text-sm text-bark outline-none transition focus:border-coral/50 focus:ring-2 focus:ring-coral/15";

  return (
    <form onSubmit={submit} className="flex gap-3">
      <Avatar name={name} size={isReply ? 32 : 40} />
      <div className="min-w-0 flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          rows={open ? 3 : 1}
          maxLength={2000}
          placeholder={placeholder}
          className={`${inputCls} resize-none`}
        />
        {errors.body && <p className="mt-1 text-xs text-coral">{errors.body}</p>}

        {/* honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={60}
                    aria-label="Your name"
                    className={inputCls}
                  />
                  {errors.name && <p className="mt-1 text-xs text-coral">{errors.name}</p>}
                </div>
                <div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (kept private)"
                    type="email"
                    maxLength={160}
                    aria-label="Your email"
                    className={inputCls}
                  />
                  {errors.email && <p className="mt-1 text-xs text-coral">{errors.email}</p>}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-bark/55 transition hover:bg-maple/10 hover:text-bark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-gradient-to-r from-coral to-maple px-5 py-1.5 text-sm font-semibold text-white shadow-[var(--shadow-warm)] transition hover:brightness-105 active:scale-95 disabled:opacity-60"
                >
                  {submitting ? "Posting…" : isReply ? "Reply" : "Comment"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

/* ── A single comment / reply row ─────────────────────────────────────── */
function CommentRow({
  comment,
  small = false,
  owner,
  onReply,
  onDelete,
}: {
  comment: Comment;
  small?: boolean;
  owner: boolean;
  onReply: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex gap-3">
      <Avatar name={comment.author_name} size={small ? 32 : 40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-bark">{comment.author_name}</span>
          <span className="text-xs text-bark/45">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-bark/85">
          {comment.body}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-xs">
          <button
            onClick={onReply}
            className="font-semibold uppercase tracking-wide text-bark/50 transition hover:text-coral"
          >
            Reply
          </button>
          {owner && !confirm && (
            <button
              onClick={() => setConfirm(true)}
              className="text-bark/35 transition hover:text-coral"
            >
              Delete
            </button>
          )}
          {owner && confirm && (
            <span className="inline-flex items-center gap-2">
              <button
                onClick={() => {
                  onDelete(comment.id);
                  setConfirm(false);
                }}
                className="font-semibold text-coral"
              >
                Delete?
              </button>
              <button onClick={() => setConfirm(false)} className="text-bark/45">
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── A root comment with its (flat, one-level) replies ────────────────── */
function CommentThread({
  root,
  replies,
  owner,
  blogId,
  onPosted,
  onDelete,
}: {
  root: Comment;
  replies: Comment[];
  owner: boolean;
  blogId: string;
  onPosted: (c: Comment) => void;
  onDelete: (id: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  function posted(c: Comment) {
    onPosted(c);
    setReplyTo(null);
    setShowReplies(true);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <CommentRow
        comment={root}
        owner={owner}
        onReply={() => setReplyTo(root)}
        onDelete={onDelete}
      />

      {replyTo?.id === root.id && (
        <div className="ml-[52px] mt-2">
          <CommentForm
            blogId={blogId}
            parentId={root.id}
            autoFocus
            placeholder={`Reply to ${root.author_name}…`}
            onPosted={posted}
            onCancel={() => setReplyTo(null)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <button
          onClick={() => setShowReplies((s) => !s)}
          className="ml-[52px] mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-coral transition hover:bg-coral/10"
        >
          <span className={`transition-transform ${showReplies ? "rotate-180" : ""}`}>▾</span>
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </button>
      )}

      <AnimatePresence initial={false}>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="ml-[26px] mt-2 overflow-hidden border-l-2 border-maple/15 pl-5"
          >
            <div className="flex flex-col gap-4">
              {replies.map((r) => (
                <div key={r.id}>
                  <CommentRow
                    comment={r}
                    small
                    owner={owner}
                    onReply={() => setReplyTo(r)}
                    onDelete={onDelete}
                  />
                  {replyTo?.id === r.id && (
                    <div className="ml-[44px] mt-2">
                      <CommentForm
                        blogId={blogId}
                        parentId={root.id}
                        initial={`@${r.author_name} `}
                        autoFocus
                        placeholder={`Reply to ${r.author_name}…`}
                        onPosted={posted}
                        onCancel={() => setReplyTo(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */
export default function Comments({ blogId }: { blogId: string }) {
  const { owner } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  // Render a stable placeholder until mounted so SSR and the first client render
  // match exactly — this client-only widget then takes over with no hydration risk.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("comments")
        .select(COLS)
        .eq("blog_id", blogId)
        .order("created_at", { ascending: true });
      if (!active) return;
      setComments((data as Comment[] | null) ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [blogId, supabase]);

  const { roots, repliesByRoot } = useMemo(() => {
    const roots = comments
      .filter((c) => !c.parent_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)); // newest first
    const repliesByRoot = new Map<string, Comment[]>();
    for (const c of comments) {
      if (!c.parent_id) continue;
      const arr = repliesByRoot.get(c.parent_id) ?? [];
      arr.push(c);
      repliesByRoot.set(c.parent_id, arr);
    }
    for (const arr of repliesByRoot.values())
      arr.sort((a, b) => a.created_at.localeCompare(b.created_at)); // oldest first
    return { roots, repliesByRoot };
  }, [comments]);

  function handlePosted(c: Comment) {
    setComments((prev) => (prev.some((p) => p.id === c.id) ? prev : [...prev, c]));
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return;
    setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
  }

  if (!mounted)
    return (
      <section className="mx-auto mt-16 max-w-[760px] border-t border-maple/15 pt-10">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-bark">
          <span aria-hidden>💬</span> Comments
        </h2>
        <p className="mt-6 text-sm text-bark/40">Loading comments…</p>
      </section>
    );

  return (
    <section className="mx-auto mt-16 max-w-[760px] border-t border-maple/15 pt-10">
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-bark">
        <span aria-hidden>💬</span>
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h2>

      <div className="mt-6">
        <CommentForm blogId={blogId} onPosted={handlePosted} />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {loading ? (
          <p className="text-sm text-bark/40">Loading comments…</p>
        ) : roots.length === 0 ? (
          <p className="text-sm text-bark/45">
            No comments yet — be the first to share a thought. 🍁
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {roots.map((r) => (
              <CommentThread
                key={r.id}
                root={r}
                replies={repliesByRoot.get(r.id) ?? []}
                owner={owner}
                blogId={blogId}
                onPosted={handlePosted}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
