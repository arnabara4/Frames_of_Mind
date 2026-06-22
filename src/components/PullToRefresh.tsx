"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Native-feeling pull-to-refresh — only for the installed PWA (plain browsers
 * already ship their own, so this arms only in standalone display mode). No
 * custom indicator: the OS overscroll bounce is the feedback, and a firm pull
 * past the threshold while pinned at the very top fires a soft `router.refresh()`
 * (re-fetches server data, no full-reload flash). Disabled while the drawer
 * overlay is open (listens to the shared `fom:overlay` event).
 */
const THRESHOLD = 90; // px of downward overscroll needed to trigger

export default function PullToRefresh() {
  const router = useRouter();

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;

    let startY = 0;
    let pulling = false;
    let overlay = false;
    let refreshing = false;

    const onOverlay = (e: Event) => {
      overlay = !!(e as CustomEvent<{ open: boolean }>).detail?.open;
    };
    const onStart = (e: TouchEvent) => {
      pulling =
        !refreshing && !overlay && e.touches.length === 1 && window.scrollY <= 0;
      startY = pulling ? e.touches[0].clientY : 0;
    };
    const onEnd = (e: TouchEvent) => {
      if (!pulling || refreshing) return;
      pulling = false;
      if (window.scrollY > 0) return; // a real scroll happened, not a top-pull
      const dy = (e.changedTouches[0]?.clientY ?? startY) - startY;
      if (dy >= THRESHOLD) {
        refreshing = true;
        navigator.vibrate?.(10);
        router.refresh();
        // brief guard so an immediate second pull doesn't double-fire
        window.setTimeout(() => {
          refreshing = false;
        }, 1200);
      }
    };
    const onCancel = () => {
      pulling = false;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onCancel, { passive: true });
    window.addEventListener("fom:overlay", onOverlay);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onCancel);
      window.removeEventListener("fom:overlay", onOverlay);
    };
  }, [router]);

  return null;
}
