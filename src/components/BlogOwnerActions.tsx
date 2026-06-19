"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { revalidatePaths } from "@/lib/revalidate";

/** Edit / Delete controls shown on a blog detail page — owner only. */
export default function BlogOwnerActions({ blogId }: { blogId: string }) {
  const { owner } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!owner) return null;

  async function handleDelete() {
    setBusy(true);
    await supabase.from("blogs").delete().eq("id", blogId);
    await revalidatePaths(["/", "/blogs"]);
    router.push("/blogs");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/blogs/${blogId}/edit`}
        className="rounded-lg border border-coral/40 px-4 py-1.5 text-sm font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
      >
        Edit
      </Link>
      {confirming ? (
        <span className="flex items-center gap-2 text-sm">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="rounded-lg bg-coral px-4 py-1.5 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
          >
            {busy ? "Deleting…" : "Confirm"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-black/15 px-4 py-1.5 text-sm font-medium text-ink/60 transition hover:border-coral hover:text-coral active:scale-95"
        >
          Delete
        </button>
      )}
    </div>
  );
}
