"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const EMOJIS = ["🍂", "🍁", "🍃", "🌿"];

/**
 * A full-screen autumn-leaf confetti burst. Increment `trigger` to play it once
 * (e.g. on a successful save). Pure delight — pointer-events-none, reduced-motion
 * aware. Also fires a tiny haptic on supported devices.
 */
export default function LeafBurst({ trigger }: { trigger: number }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger <= 0 || reduce) return;
    setShow(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([12, 30, 12]);
    }
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, [trigger, reduce]);

  const parts = useMemo(() => {
    const n = 26;
    return Array.from({ length: n }, (_, i) => {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const dist = 140 + Math.random() * 240;
      return {
        e: EMOJIS[i % EMOJIS.length],
        x: Math.cos(ang) * dist,
        y: Math.sin(ang) * dist - 50,
        r: Math.random() * 760 - 380,
        s: 0.7 + Math.random() * 1.1,
        d: Math.random() * 0.12,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center overflow-hidden">
          {parts.map((p, i) => (
            <motion.span
              key={i}
              className="absolute select-none text-2xl"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: p.s, rotate: p.r }}
              transition={{ duration: 1.25, delay: p.d, ease: [0.16, 1, 0.3, 1] }}
            >
              {p.e}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
