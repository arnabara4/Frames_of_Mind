"use client";

import LottiePlayer from "@/components/LottiePlayer";
import { useReducedMotion } from "framer-motion";

/**
 * Global ambient autumn-leaves background. Fixed, covers the viewport, sits
 * behind all content at low opacity so it never hurts readability. Loops
 * continuously on every page. Disabled under reduced-motion.
 */
export default function LottieBackground() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <LottiePlayer
        src="/lottifiles/autumn-fall.lottie"
        loop
        autoplay
        className="h-full w-full opacity-[0.28]"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
