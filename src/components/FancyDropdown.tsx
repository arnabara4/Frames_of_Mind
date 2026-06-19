"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * A small themed popover dropdown (button + animated panel) used for the
 * blog month/year filters. Closes on outside-click or Escape.
 */
export default function FancyDropdown({
  label,
  summary,
  icon,
  children,
  align = "right",
  panelClass = "w-64",
}: {
  label: string;
  summary: string;
  icon?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  panelClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${
          open
            ? "border-coral bg-white text-coral shadow-sm"
            : "border-maple/20 bg-white/80 text-bark/80 hover:border-coral"
        }`}
      >
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-maple/60">
          {label}
        </span>
        <span className="font-semibold">{summary}</span>
        <span
          className={`text-xs text-maple/60 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-maple/15 bg-cream/95 p-2 shadow-[0_24px_60px_-24px_rgba(156,52,21,0.6)] backdrop-blur-md ${panelClass} ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
