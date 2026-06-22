"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-coral to-maple px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-warm)] ring-1 ring-white/30"
      >
        {/* shimmer sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
        />
        <motion.span
          aria-hidden
          animate={{ y: [0, 2.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative grid h-5 w-5 place-items-center rounded-full bg-white/25 text-[13px]"
        >
          ⬇
        </motion.span>
        <span className="relative">Install app</span>
        <span
          aria-hidden
          className="relative -ml-0.5 text-base transition-transform duration-300 group-hover:rotate-[14deg]"
        >
          🍁
        </span>
      </motion.button>
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
