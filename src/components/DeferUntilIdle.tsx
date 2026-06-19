"use client";

import { useEffect, useState } from "react";

/**
 * Renders children only after the browser goes idle (and the tab is visible),
 * so non-critical decorative work (e.g. the ambient Lottie) never competes with
 * first paint / hydration. Falls back to a timeout where requestIdleCallback is
 * unavailable.
 */
export default function DeferUntilIdle({
  children,
  timeout = 1500,
}: {
  children: React.ReactNode;
  timeout?: number;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => !cancelled && setReady(true);

    type RIC = (cb: () => void, opts?: { timeout: number }) => number;
    const ric: RIC | undefined = (window as unknown as { requestIdleCallback?: RIC })
      .requestIdleCallback;

    const id = ric ? ric(run, { timeout }) : window.setTimeout(run, 300);
    return () => {
      cancelled = true;
      if (!ric) clearTimeout(id);
    };
  }, [timeout]);

  if (!ready) return null;
  return <>{children}</>;
}
