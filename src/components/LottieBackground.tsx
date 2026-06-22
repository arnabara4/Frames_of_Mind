"use client";

import LottiePlayer from "@/components/LottiePlayer";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type DotLottie = { play: () => void; pause: () => void } | null;

/** Treat budget phones / data-saver / low-RAM devices as low-end. */
function useLowEnd() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const n = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (n.connection?.saveData) return true;
    if (typeof n.deviceMemory === "number" && n.deviceMemory <= 4) return true;
    if (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency <= 4)
      return true;
    return false;
  }, []);
}

/**
 * Global ambient autumn-leaves background. Heavily tuned for smoothness:
 *  - skipped entirely on low-end / data-saver devices (the warm CSS gradient stays)
 *  - canvas pixel density capped to 1 (no 2–3× retina overdraw) + frozen offscreen
 *  - PAUSED during scroll and resumed on idle, so scrolling is never starved
 *  - paused when the tab is hidden; disabled under reduced-motion
 */
export default function LottieBackground() {
  const reduce = useReducedMotion();
  const lowEnd = useLowEnd();
  const [visible, setVisible] = useState(true);
  const dot = useRef<DotLottie>(null);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Pause the canvas while the user is actively scrolling → buttery scroll.
  useEffect(() => {
    if (reduce || lowEnd) return;
    let t: ReturnType<typeof setTimeout>;
    let scrolling = false;
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        dot.current?.pause();
      }
      clearTimeout(t);
      t = setTimeout(() => {
        scrolling = false;
        dot.current?.play();
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, [reduce, lowEnd]);

  // Pause the canvas while a full-screen overlay (mobile drawer) is open, so the
  // slide stays buttery; resume when it closes (unless the tab is hidden).
  useEffect(() => {
    if (reduce || lowEnd) return;
    const onOverlay = (e: Event) => {
      const isOpen = (e as CustomEvent<{ open: boolean }>).detail?.open;
      if (isOpen) dot.current?.pause();
      else if (!document.hidden) dot.current?.play();
    };
    window.addEventListener("fom:overlay", onOverlay);
    return () => window.removeEventListener("fom:overlay", onOverlay);
  }, [reduce, lowEnd]);

  if (reduce || lowEnd || !visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transform-gpu overflow-hidden [contain:strict] [will-change:transform]"
    >
      <LottiePlayer
        src="/lottifiles/autumn-fall.lottie"
        loop
        autoplay
        layout={{ fit: "cover", align: [0.5, 0.5] }}
        renderConfig={{
          devicePixelRatio: 1,
          autoResize: true,
          freezeOnOffscreen: true,
        }}
        dotLottieRefCallback={(d: DotLottie) => {
          dot.current = d;
        }}
        className="h-full w-full opacity-[0.16] md:opacity-[0.26]"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
