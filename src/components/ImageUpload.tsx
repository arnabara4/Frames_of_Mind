"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "blog-images";

/** Uploads a chosen image to Supabase Storage and returns its public URL. */
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

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setBusy(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setBusy(false);
      setError(upErr.message);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onUploaded(data.publicUrl);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white transition hover:bg-coral-dark active:scale-95 disabled:opacity-60"
      >
        {busy ? "Uploading…" : `⬆ ${label}`}
      </button>
      {error && <p className="text-xs text-coral-dark">{error}</p>}
    </div>
  );
}
