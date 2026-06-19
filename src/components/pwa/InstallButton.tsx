"use client";

import { useEffect, useRef, useState } from "react";
import { useInstall } from "@/components/pwa/InstallProvider";
import { useAuth } from "@/components/AuthProvider";

/** Owner-only install button for the home page (top-right). Always visible to
 *  the owner (until installed); falls back to guidance when the browser hasn't
 *  surfaced a native prompt yet. */
export default function InstallButton() {
  const { canInstall, isIOS, installed, promptInstall } = useInstall();
  const { owner } = useAuth();
  const [hint, setHint] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hint) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setHint(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [hint]);

  if (!owner || installed) return null;

  async function onClick() {
    if (canInstall) {
      await promptInstall();
    } else {
      setHint((h) => !h);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-coral/40 bg-white/70 px-4 py-2 text-sm font-semibold text-coral shadow-sm backdrop-blur transition hover:bg-coral hover:text-white active:scale-95"
      >
        ⬇ Install app
      </button>
      {hint && !canInstall && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-maple/15 bg-cream/95 p-3 text-sm leading-relaxed text-bark/75 shadow-lg backdrop-blur">
          {isIOS ? (
            <>
              Tap <span className="font-semibold">Share</span> →{" "}
              <span className="font-semibold">Add to Home Screen</span> to
              install.
            </>
          ) : (
            <>
              Open this site in <span className="font-semibold">Chrome</span> or{" "}
              <span className="font-semibold">Edge</span>, then use the install
              icon in the address bar (or browser menu →{" "}
              <span className="font-semibold">Install</span>).
            </>
          )}
        </div>
      )}
    </div>
  );
}
