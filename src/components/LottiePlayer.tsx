"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Lazy-load the dotLottie runtime AND point it at a self-hosted WASM file
// (instead of jsdelivr/unpkg), so our CSP allows it and there's no external
// runtime dependency. The .wasm is copied from the installed package version.
const DotLottieReact = dynamic(
  () =>
    import("@lottiefiles/dotlottie-react").then((m) => {
      try {
        m.setWasmUrl("/dotlottie/dotlottie-player.wasm");
      } catch {}
      return m.DotLottieReact;
    }),
  { ssr: false },
);

export default function LottiePlayer(
  props: ComponentProps<typeof DotLottieReact>,
) {
  return <DotLottieReact {...props} />;
}
