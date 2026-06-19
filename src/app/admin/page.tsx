import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth";
import type { Blog } from "@/lib/types";
import { formatDate } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Message {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  body: string | null;
  created_at: string;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isOwner(user)) redirect("/");

  const [{ data: blogsData }, { data: messagesData }] = await Promise.all([
    supabase.from("blogs").select("*").order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const blogs = (blogsData ?? []) as Blog[];
  const messages = (messagesData ?? []) as Message[];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-coral/70">
            Owner dashboard
          </p>
          <h1 className="font-display text-4xl font-extrabold text-coral md:text-5xl">
            Welcome back, Pranavi
          </h1>
        </div>
        <Link
          href="/blogs/new"
          className="self-start rounded-xl bg-coral px-6 py-3 font-medium text-white shadow-sm transition hover:bg-coral-dark hover:shadow-md active:scale-95"
        >
          + New Blog
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Published" value={blogs.length} />
        <Stat label="Messages" value={messages.length} />
        <Stat
          label="Latest post"
          value={blogs[0] ? formatDate(blogs[0].created_at) : "—"}
          small
        />
      </div>

      {/* Manage blogs */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Your blogs</h2>
        <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          {blogs.length === 0 ? (
            <p className="px-6 py-8 text-ink/50">No blogs yet.</p>
          ) : (
            blogs.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 px-6 py-4 transition hover:bg-peach/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={`/blogs/${b.id}`}
                    className="font-display text-lg font-semibold text-ink hover:text-coral"
                  >
                    {b.title}
                  </Link>
                  <p className="text-sm text-ink/50">
                    {formatDate(b.created_at)} · {b.read_time}
                  </p>
                </div>
                <Link
                  href={`/blogs/${b.id}/edit`}
                  className="self-start rounded-lg border border-coral/40 px-4 py-1.5 text-sm font-medium text-coral transition hover:bg-coral hover:text-white"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Inbox */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">
          Contact messages
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="rounded-2xl bg-white px-6 py-8 text-ink/50 ring-1 ring-black/5">
              No messages yet.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") ||
                      "Anonymous"}
                  </p>
                  <p className="text-sm text-ink/40">
                    {formatDate(m.created_at)}
                  </p>
                </div>
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="text-sm text-coral hover:underline"
                  >
                    {m.email}
                  </a>
                )}
                <p className="mt-2 whitespace-pre-wrap text-ink/80">{m.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-peach/60 to-salmon/40 p-5 ring-1 ring-black/5">
      <p className="text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p
        className={`mt-1 font-display font-bold text-coral ${
          small ? "text-lg" : "text-3xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
