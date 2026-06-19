"use client";

import { useState } from "react";
import { useInstall } from "@/components/pwa/InstallProvider";
import { useAuth } from "@/components/AuthProvider";

/** Owner-only install button for the home page (top-right). */
export default function InstallButton() {
  const { canInstall, isIOS, installed, promptInstall } = useInstall();
  const { owner } = useAuth();
  const [showHint, setShowHint] = useState(false);

  if (!owner || installed) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (canInstall ? promptInstall() : setShowHint((s) => !s))}
        className="inline-flex items-center gap-2 rounded-full border border-coral/40 bg-white/70 px-4 py-2 text-sm font-semibold text-coral shadow-sm backdrop-blur transition hover:bg-coral hover:text-white active:scale-95"
      >
        ⬇ Install app
      </button>
      {showHint && isIOS && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-maple/15 bg-cream/95 p-3 text-sm text-bark/70 shadow-lg backdrop-blur">
          Tap <span className="font-semibold">Share</span> →{" "}
          <span className="font-semibold">Add to Home Screen</span> to install.
        </div>
      )}
    </div>
  );
}
