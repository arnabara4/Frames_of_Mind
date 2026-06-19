"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Lazy-load the dotLottie runtime (wasm + player) so it never blocks the
// initial page load / hydration. Renders nothing until it's ready.
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false },
);

export default function LottiePlayer(
  props: ComponentProps<typeof DotLottieReact>,
) {
  return <DotLottieReact {...props} />;
}
