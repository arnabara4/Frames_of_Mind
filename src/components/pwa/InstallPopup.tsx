"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInstall } from "@/components/pwa/InstallProvider";
import { useAuth } from "@/components/AuthProvider";

const KEY = "fom-install-dismissed";

/** Gentle install prompt for regular visitors (the owner gets a button instead). */
export default function InstallPopup() {
  const { canInstall, isIOS, installed, promptInstall } = useInstall();
  const { owner } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (installed || owner) return;
    if (typeof localStorage !== "undefined" && localStorage.getItem(KEY)) return;
    if (!canInstall && !isIOS) return;
    const t = setTimeout(() => setShow(true), 3500);
    return () => clearTimeout(t);
  }, [canInstall, isIOS, installed, owner]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  async function install() {
    if (canInstall) {
      await promptInstall();
      setShow(false);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md rounded-3xl border border-maple/15 bg-cream/95 p-4 shadow-[0_24px_60px_-20px_rgba(156,52,21,0.55)] backdrop-blur-md sm:inset-x-auto sm:right-5"
        >
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-bold text-coral">
                Keep Frames of Mind close 🍂
              </p>
              {isIOS && !canInstall ? (
                <p className="mt-0.5 text-sm leading-relaxed text-bark/70">
                  Tap <span className="font-semibold">Share</span> →{" "}
                  <span className="font-semibold">Add to Home Screen</span> to
                  install.
                </p>
              ) : (
                <p className="mt-0.5 text-sm leading-relaxed text-bark/70">
                  Install the app for a faster, full-screen read — right from your
                  home screen.
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {canInstall && (
                  <button
                    onClick={install}
                    className="rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white transition hover:bg-coral-dark active:scale-95"
                  >
                    Install
                  </button>
                )}
                <button
                  onClick={dismiss}
                  className="rounded-full px-3 py-2 text-sm font-medium text-bark/50 transition hover:text-bark"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-bark/40 transition hover:text-bark"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
