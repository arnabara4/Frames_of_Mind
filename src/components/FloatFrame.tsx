"use client";

import { motion, useReducedMotion } from "framer-motion";
import Thumb from "@/components/Thumb";

/**
 * A photo frame that gently floats and tilts upright on hover — the literal
 * "frame" of Frames of Mind. `ornate` gives the hero frames a richer album
 * treatment (warm mat, inner hairline, photo corners) to set them apart from
 * the plain gallery polaroids.
 */
export default function FloatFrame({
  seed = 0,
  src,
  rotate = 0,
  delay = 0,
  floatRange = 10,
  caption,
  tape = true,
  ornate = false,
  aspect = "aspect-[4/5]",
  className = "",
  priority = false,
}: {
  seed?: number;
  src?: string | null;
  rotate?: number;
  delay?: number;
  floatRange?: number;
  caption?: string;
  tape?: boolean;
  ornate?: boolean;
  aspect?: string;
  className?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  const frame = ornate
    ? "rounded-[22px] bg-gradient-to-br from-white via-cream to-peach/40 p-3.5 pb-9 shadow-[0_34px_70px_-30px_rgba(156,52,21,0.85)] ring-1 ring-maple/25"
    : "rounded-[18px] bg-white p-2.5 pb-7 shadow-[var(--shadow-warm)] ring-1 ring-maple/15";

  return (
    <motion.div
      style={{ rotate }}
      animate={reduce ? undefined : { y: [0, -floatRange, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      whileHover={reduce ? undefined : { rotate: 0, scale: 1.045, y: -8 }}
      className={`group relative transform-gpu ${className}`}
    >
      {tape && (
        <span className="absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 rotate-[-4deg] rounded-[2px] bg-amber/35 shadow-sm ring-1 ring-white/50 backdrop-blur-sm" />
      )}

      <div className={`transition-shadow duration-300 group-hover:shadow-[0_40px_80px_-30px_rgba(156,52,21,0.9)] ${frame}`}>
        {/* gold corner flourishes on the ornate frame */}
        {ornate && (
          <>
            <Corner className="left-1.5 top-1.5 border-l-2 border-t-2" />
            <Corner className="right-1.5 top-1.5 border-r-2 border-t-2" />
            <Corner className="bottom-9 left-1.5 border-b-2 border-l-2" />
            <Corner className="bottom-9 right-1.5 border-b-2 border-r-2" />
          </>
        )}

        <div
          className={`relative overflow-hidden rounded-[12px] ${aspect} ${
            ornate
              ? "ring-1 ring-maple/20 [box-shadow:inset_0_0_0_3px_#fff8f1,inset_0_0_0_4px_rgba(182,67,42,0.25)]"
              : ""
          }`}
        >
          <Thumb
            src={src}
            alt={caption ?? ""}
            seed={seed}
            rounded="rounded-[12px]"
            className="h-full w-full"
            priority={priority}
            sizes="(max-width: 768px) 60vw, 320px"
          />
        </div>

        {caption && (
          <p className="absolute bottom-2 left-0 right-0 text-center font-script text-sm text-bark/60">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** A small L-shaped gold photo-corner mount. */
function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-10 h-4 w-4 rounded-[2px] border-amber/70 ${className}`}
    />
  );
}
