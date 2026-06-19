"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "blog-images";

/** Uploads a new image OR lets the owner reuse one already in storage. */
export default function ImageUpload({
  onUploaded,
  label = "Upload",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLib, setShowLib] = useState(false);
  const [lib, setLib] = useState<string[] | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be under 5 MB.");

    setBusy(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      setBusy(false);
      return setError(upErr.message);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onUploaded(data.publicUrl);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function openLibrary() {
    setShowLib((s) => !s);
    if (lib) return;
    const { data } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    const urls = (data ?? [])
      .filter((o) => o.name && !o.name.startsWith("."))
      .map((o) => supabase.storage.from(BUCKET).getPublicUrl(o.name).data.publicUrl);
    setLib(urls);
  }

  return (
    <div className="relative flex flex-col gap-1">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-coral px-3.5 py-2 text-sm font-medium text-white transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
        >
          {busy ? "Uploading…" : `⬆ ${label}`}
        </button>
        <button
          type="button"
          onClick={openLibrary}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition active:scale-95 ${
            showLib ? "border-coral bg-peach/40 text-coral" : "border-maple/25 bg-white/70 text-bark/70 hover:border-coral"
          }`}
        >
          🗂 Library
        </button>
      </div>

      {error && <p className="text-xs text-coral-dark">{error}</p>}

      {showLib && (
        <div className="absolute top-full z-50 mt-2 w-72 rounded-2xl border border-maple/15 bg-cream/95 p-3 shadow-[0_24px_60px_-24px_rgba(156,52,21,0.6)] backdrop-blur-md">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-maple/60">
            Reuse an image
          </p>
          {lib === null ? (
            <p className="py-4 text-center text-sm text-ink/40">Loading…</p>
          ) : lib.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink/40">No images yet.</p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
              {lib.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    onUploaded(url);
                    setShowLib(false);
                  }}
                  className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-maple/15 transition hover:ring-2 hover:ring-coral"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
