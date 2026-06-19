"use client";

import LottiePlayer from "@/components/LottiePlayer";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Global ambient autumn-leaves background. Fixed, covers the viewport, sits
 * behind all content at low opacity. GPU-promoted, paused when the tab is
 * hidden, and disabled under reduced-motion — so it never starves the main
 * thread during reading or scrolling.
 */
export default function LottieBackground() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reduce || !visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transform-gpu overflow-hidden [contain:strict] [will-change:transform]"
    >
      <LottiePlayer
        src="/lottifiles/autumn-fall.lottie"
        loop
        autoplay
        className="h-full w-full opacity-[0.16] md:opacity-[0.28]"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
