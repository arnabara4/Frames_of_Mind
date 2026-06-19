import FallingLeaves from "@/components/FallingLeaves";

/** Header used when a post has no cover image: warm gradient + falling leaves. */
export default function CoverFallback({ count = 12 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-amber/70 via-coral/50 to-maple/70">
      <FallingLeaves count={count} />
    </div>
  );
}
