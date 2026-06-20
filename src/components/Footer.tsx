import Link from "next/link";

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
  { href: "/about", label: "About Me" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 w-full overflow-hidden bg-gradient-to-br from-coral via-maple to-rust text-white [contain-intrinsic-size:auto_460px] [content-visibility:auto]">
      {/* Giant background wordmark — centered watermark spanning the footer, clipped at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      >
        <span className="whitespace-nowrap font-display text-[26vw] font-black leading-none tracking-tight text-white/10 select-none">
          Frames of Mind
        </span>
      </div>

      {/* Soft top edge so the section blends from the page above. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-rust/30 to-transparent" />

      {/* Foreground content — layered directly over the wordmark */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">
              Frames of Mind
            </p>
            <p className="mt-3 max-w-sm font-serif text-base italic leading-relaxed text-white/80">
              A sanctuary of words — where the written self steps forward when
              the spoken one falters.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-white/85 transition hover:text-white"
                  >
                    <span className="h-px w-0 bg-white transition-all duration-300 group-hover:w-4" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Let&apos;s Connect
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/contact"
                  className="text-white/85 transition hover:text-white"
                >
                  Write to me →
                </Link>
              </li>
              <li>
                <a
                  href="#top"
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1.5 text-sm text-white transition hover:bg-white hover:text-coral"
                >
                  ↑ Back to top
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/15 pt-6 text-sm text-white/70 md:flex-row">
          <p>© 2025 Frames of Mind. All rights reserved.</p>
          <p className="font-serif italic">Made with autumn &amp; ink.</p>
        </div>
      </div>
    </footer>
  );
}
