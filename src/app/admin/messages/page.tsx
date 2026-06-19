import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth";
import type { Message } from "@/components/MessageCard";
import MessagesInbox from "@/components/MessagesInbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isOwner(user)) redirect("/");

  const { data } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as Message[];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-maple/20 bg-white/60 px-4 py-1.5 text-sm font-medium text-bark/70 transition hover:-translate-x-0.5 hover:border-coral hover:text-coral"
        >
          ← Dashboard
        </Link>
        <span className="rounded-full bg-coral/10 px-4 py-1.5 text-sm font-semibold text-coral ring-1 ring-coral/15">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>

      <p className="text-sm uppercase tracking-[0.25em] text-coral/70">Inbox</p>
      <h1 className="font-display text-4xl font-extrabold text-coral md:text-5xl">
        What&apos;s on their minds
      </h1>

      <MessagesInbox messages={messages} />
    </div>
  );
}
