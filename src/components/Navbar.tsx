"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LottiePlayer from "@/components/LottiePlayer";
import { useAuth } from "@/components/AuthProvider";

/* ── Minimal line icons (autumn-soft, stroke = currentColor) ──────────── */
const ic = {
  stroke: 1.6,
  size: 18,
};
function I({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width={ic.size}
      height={ic.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ic.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
const Home = () => (
  <I>
    <path d="M3 9.5 12 3l9 6.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-5h4v5" />
  </I>
);
const Book = () => (
  <I>
    <path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" />
    <path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />
  </I>
);
const Leaf = () => (
  <I>
    <path d="M11 20A7 7 0 0 1 4 13C4 8 9 4 20 4c0 9-5 14-9 14z" />
    <path d="M4 20c3.5-3.5 7-5.5 12-7" />
  </I>
);
const Mail = () => (
  <I>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </I>
);
const Grid = () => (
  <I>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </I>
);
const LogOut = () => (
  <I>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </I>
);

const LINKS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/blogs", label: "Blogs", Icon: Book },
  { href: "/about", label: "About", Icon: Leaf },
  { href: "/contact", label: "Contact", Icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, owner, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-maple/10 bg-cream/80 shadow-[0_1px_24px_-16px_rgba(156,52,21,0.5)] backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <LottiePlayer
            src="/lottifiles/october-go.lottie"
            loop
            autoplay
            aria-hidden
            className="h-10 w-10 shrink-0 transition-transform group-hover:scale-105 md:h-11 md:w-11"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-coral md:text-[22px]">
              Frames of Mind
            </span>
            <span className="mt-0.5 font-serif text-[10px] italic tracking-wide text-maple/70">
              a gift, in autumn words
            </span>
          </span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors md:px-4 ${
                  active ? "text-coral" : "text-bark/70 hover:text-coral"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-peach/45 ring-1 ring-coral/15"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Owner-only (static highlight — avoids fighting the shared nav pill) */}
          {owner && (
            <>
              <Link
                href="/admin/messages"
                className={`relative ml-1 flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors md:px-4 ${
                  pathname.startsWith("/admin/messages")
                    ? "bg-peach/45 text-coral ring-1 ring-coral/15"
                    : "text-bark/70 hover:text-coral"
                }`}
              >
                <Mail />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Inbox
                </span>
              </Link>
              <Link
                href="/admin"
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors md:px-4 ${
                  pathname === "/admin" || pathname.startsWith("/admin/home")
                    ? "bg-peach/45 text-coral ring-1 ring-coral/15"
                    : "text-bark/70 hover:text-coral"
                }`}
              >
                <Grid />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Studio
                </span>
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              title="Log out"
              aria-label="Log out"
              className="ml-1 flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-bark/45 transition-colors hover:text-coral md:px-4"
            >
              <LogOut />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                Logout
              </span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
