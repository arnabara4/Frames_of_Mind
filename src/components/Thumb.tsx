/**
 * Image thumbnail with a graceful gradient placeholder.
 * Figma used anime artwork; until real assets exist we render a tasteful
 * coral/peach gradient block so the layout stays faithful.
 */
export default function Thumb({
  src,
  alt,
  className = "",
  seed = 0,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  seed?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className={`object-cover ${className}`}
      />
    );
  }

  const gradients = [
    "from-coral/80 via-salmon to-peach",
    "from-peach via-salmon to-coral/70",
    "from-salmon via-peach to-coral/60",
  ];
  const g = gradients[seed % gradients.length];

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${g} ${className}`}
      aria-label={alt}
    >
      <span className="font-display text-white/70 text-lg select-none">
        Frames of Mind
      </span>
    </div>
  );
}
