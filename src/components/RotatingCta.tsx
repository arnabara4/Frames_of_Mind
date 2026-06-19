"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Non-blog destinations the second hero button cycles through (blogs is the
// first button, to its left).
const PAGES = [
  { label: "About me", href: "/about" },
  { label: "Say hello", href: "/contact" },
  { label: "Wander in", href: "/about" },
];

export default function RotatingCta() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % PAGES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const cur = PAGES[i];

  return (
    <button
      type="button"
      onClick={() => router.push(cur.href)}
      className="inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full border border-coral/40 bg-white/60 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-coral transition hover:bg-white active:scale-95"
    >
      <span className="relative inline-flex h-[1.25em] items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={reduce ? false : { y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "-110%", opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block whitespace-nowrap"
          >
            {cur.label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-hidden>→</span>
    </button>
  );
}
