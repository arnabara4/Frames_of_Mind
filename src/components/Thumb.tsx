"use client";

import { useEffect, useState } from "react";

/**
 * Image with a graceful autumn placeholder and an optional "framed" treatment
 * (elegant border, rounded corners, warm drop shadow). If the src is missing or
 * fails to load, it falls back to a warm gradient block so the layout never breaks.
 */
export default function Thumb({
  src,
  alt,
  className = "",
  seed = 0,
  framed = false,
  rounded = "rounded-2xl",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  seed?: number;
  framed?: boolean;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);

  // Reset the error state if the src changes (e.g. live editor preview).
  useEffect(() => {
    setFailed(false);
  }, [src]);

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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src as string}
            alt={alt ?? ""}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]"
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
