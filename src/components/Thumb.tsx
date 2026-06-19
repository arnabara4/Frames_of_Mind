"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Tiny warm blur shown while the real image streams in (prevents flashes).
const BLUR =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='10'%3E%3Crect width='8' height='10' fill='%23f6c3b0'/%3E%3C/svg%3E";

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
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  seed?: number;
  framed?: boolean;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

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

  return (
    <div className={`overflow-hidden ${rounded} ${frame} ${className}`}>
      <div className={`relative h-full w-full overflow-hidden ${rounded}`}>
        {showImg ? (
          <Image
            src={src as string}
            alt={alt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR}
            onError={() => setFailed(true)}
            className="object-cover transition duration-700 hover:scale-[1.04]"
          />
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
