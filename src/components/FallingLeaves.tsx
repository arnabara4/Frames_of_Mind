"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/** A single maple-leaf silhouette. */
function Leaf({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
      <path
        fill={color}
        d="M16 2c1.2 2.6 2.9 4.2 5.2 4.7-1 .9-1.4 1.8-1.2 2.9 2-1 3.9-1.1 5.8-.3-1.4 1-2.2 2.2-2.1 3.7 2.2-.4 4 0 5.5 1.4-1.7.4-2.9 1.3-3.4 2.9 1.9.5 3.2 1.6 3.8 3.4-2.4-.5-4.4-.2-6 1 .9 1 1.2 2.1.9 3.4-2-1.3-4-1.7-6-1.1.2 1.3-.1 2.5-1 3.6-.9-1.7-2.2-2.7-4-3l-.7 6.3h-1.6l-.7-6.3c-1.8.3-3.1 1.3-4 3-.9-1.1-1.2-2.3-1-3.6-2-.6-4-.2-6 1.1-.3-1.3 0-2.4.9-3.4-1.6-1.2-3.6-1.5-6-1 .6-1.8 1.9-2.9 3.8-3.4-.5-1.6-1.7-2.5-3.4-2.9 1.5-1.4 3.3-1.8 5.5-1.4.1-1.5-.7-2.7-2.1-3.7 1.9-.8 3.8-.7 5.8.3.2-1.1-.2-2-1.2-2.9C13.1 6.2 14.8 4.6 16 2z"
      />
    </svg>
  );
}

const COLORS = ["#e35336", "#d98324", "#efb04a", "#b6432a", "#9c3415"];

interface Drop {
  left: number;
  size: number;
  delay: number;
  duration: number;
  sway: number;
  spin: number;
  color: string;
  opacity: number;
}

/**
 * Ambient falling-leaves layer. Sits behind content (pointer-events-none,
 * low opacity) so it never hurts readability. Disabled for reduced-motion.
 */
export default function FallingLeaves({ count = 14 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Random leaf positions differ between server and client renders, so only
  // render after mount (client-only) to avoid a hydration mismatch.
  useEffect(() => setMounted(true), []);

  // Thin out the leaves on small screens to protect mobile GPU/scroll perf.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const effectiveCount = isMobile ? Math.ceil(count / 2) : count;

  const drops = useMemo<Drop[]>(() => {
    const r = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: effectiveCount }, () => ({
      left: r(0, 100),
      size: r(16, 34),
      delay: r(0, 12),
      duration: r(9, 18),
      sway: r(20, 70),
      spin: r(180, 540) * (Math.random() > 0.5 ? 1 : -1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: r(0.25, 0.6),
    }));
  }, [effectiveCount]);

  if (reduce || !mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 transform-gpu overflow-hidden [contain:strict]"
    >
      {drops.map((d, i) => (
        <motion.div
          key={i}
          className="absolute top-[-8%]"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
          }}
          initial={{ y: "-10%", x: 0, rotate: 0 }}
          animate={{
            y: "115vh",
            x: [0, d.sway, -d.sway * 0.6, d.sway * 0.3, 0],
            rotate: d.spin,
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "linear",
            x: {
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <Leaf color={d.color} />
        </motion.div>
      ))}
    </div>
  );
}
