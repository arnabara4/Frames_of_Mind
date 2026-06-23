"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Cute per-seed warm blur shown while the real image streams in — a soft autumn
// glow that next/image scales up + blurs, so the photo melts into focus.
const BLUR_SETS = [
  ["e35336", "f4a896", "efb04a"],
  ["d98324", "efb04a", "ffccc1"],
  ["b6432a", "e35336", "f4a896"],
  ["efb04a", "ffccc1", "f4a896"],
];
function blurFor(seed: number): string {
  const [a, b, c] = BLUR_SETS[seed % BLUR_SETS.length];
  const svg =
    `%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='15'%3E` +
    `%3Cdefs%3E%3CradialGradient id='g' cx='35%25' cy='28%25' r='95%25'%3E` +
    `%3Cstop offset='0' stop-color='%23${a}'/%3E` +
    `%3Cstop offset='0.6' stop-color='%23${b}'/%3E` +
    `%3Cstop offset='1' stop-color='%23${c}'/%3E` +
    `%3C/radialGradient%3E%3C/defs%3E` +
    `%3Crect width='12' height='15' fill='url(%23g)'/%3E%3C/svg%3E`;
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

/**
 * Image with a graceful autumn placeholder and an optional "framed" treatment.
 * Uses next/image (AVIF/WebP, responsive srcset, lazy by default) and falls back
 * to a warm gradient if the src is missing or fails to load.
 */
export default function Thumb({
  src,
  alt,
  className = "",
  seed = 0,
  framed = false,
  rounded = "rounded-2xl",
  priority = false,
  natural = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  seed?: number;
  framed?: boolean;
  rounded?: string;
  priority?: boolean;
  /** Render at the image's own aspect ratio (full image, no crop) instead of cover-fill. */
  natural?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [trackedSrc, setTrackedSrc] = useState(src);

  // Reset load/fail state on src change via the derived-state-during-render
  // pattern (NOT an effect): a [src] effect ran AFTER next/image's onLoad —
  // which fires during commit for cached images — and clobbered `loaded`
  // back to false, leaving the shimmer stuck on already-loaded images.
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setLoaded(false);
    setFailed(false);
  }

  // Gate the shimmer on mount so SSR and the first client render match — no
  // hydration mismatch even when next/image fires onLoad during hydration.
  useEffect(() => setMounted(true), []);

  const frame = framed
    ? "p-1.5 bg-gradient-to-br from-white to-peach/40 shadow-[var(--shadow-warm)] ring-1 ring-maple/15"
    : "";

  const gradients = [
    "from-coral/80 via-salmon to-gold/70",
    "from-amber/80 via-gold/60 to-peach",
    "from-maple/70 via-coral/60 to-salmon",
    "from-gold/70 via-peach to-salmon/70",
  ];
  const g = gradients[seed % gradients.length];
  const showImg = !!src && !failed;
  const showShimmer = mounted && showImg && !loaded;

  // Natural mode: image keeps its own aspect (no crop, fits the frame, full
  // quality). Used by the About page so the live preview matches the published
  // page regardless of container width.
  if (natural) {
    return (
      <div
        className={`relative overflow-hidden ${rounded} ${frame} ${className} ${
          showShimmer ? "shimmer-warm min-h-[180px]" : ""
        }`}
      >
        {showImg ? (
          <Image
            src={src as string}
            alt={alt ?? ""}
            width={0}
            height={0}
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={blurFor(seed)}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`block ${rounded}`}
            style={{ width: "100%", height: "auto" }}
          />
        ) : (
          <div
            className={`flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br ${g} ${rounded}`}
            aria-label={alt}
          >
            <span className="select-none font-display text-lg text-white/80 drop-shadow">
              Frames of Mind
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${rounded} ${frame} ${className}`}>
      <div className={`relative h-full w-full overflow-hidden ${rounded}`}>
        {showImg ? (
          <>
            <Image
              src={src as string}
              alt={alt ?? ""}
              fill
              sizes={sizes}
              priority={priority}
              placeholder="blur"
              blurDataURL={blurFor(seed)}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className="object-cover transition duration-700 hover:scale-[1.04]"
            />
            {showShimmer && (
              <span aria-hidden className="shimmer-warm pointer-events-none absolute inset-0" />
            )}
          </>
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${g}`}
            aria-label={alt}
          >
            <span className="select-none font-display text-lg text-white/80 drop-shadow">
              Frames of Mind
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
