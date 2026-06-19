"use client";

import { motion, useReducedMotion } from "framer-motion";
import Thumb from "@/components/Thumb";

/**
 * A polaroid-style photo frame that gently floats and tilts upright on hover —
 * the literal "frame" of Frames of Mind. Used to build the hero scrapbook.
 */
export default function FloatFrame({
  seed = 0,
  src,
  rotate = 0,
  delay = 0,
  floatRange = 10,
  caption,
  tape = true,
  aspect = "aspect-[4/5]",
  className = "",
}: {
  seed?: number;
  src?: string | null;
  rotate?: number;
  delay?: number;
  floatRange?: number;
  caption?: string;
  tape?: boolean;
  aspect?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      style={{ rotate }}
      animate={reduce ? undefined : { y: [0, -floatRange, 0] }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.045, y: -8 }}
      className={`group relative ${className}`}
    >
      {tape && (
        <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 rotate-[-4deg] rounded-[2px] bg-amber/35 shadow-sm ring-1 ring-white/50 backdrop-blur-sm" />
      )}
      <div className="rounded-[18px] bg-white p-2.5 pb-7 shadow-[var(--shadow-warm)] ring-1 ring-maple/15 transition-shadow duration-300 group-hover:shadow-[0_30px_60px_-25px_rgba(156,52,21,0.7)]">
        <div className={`overflow-hidden rounded-[12px] ${aspect}`}>
          <Thumb src={src} seed={seed} rounded="rounded-[12px]" className="h-full w-full" />
        </div>
        {caption && (
          <p className="absolute bottom-1.5 left-0 right-0 text-center font-script text-sm text-bark/60">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}
