"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close the mobile drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll while the drawer is open WITHOUT losing scroll position.
  // (Plain `overflow:hidden` clips page height and snaps the page to the top —
  // the position-fixed + restore approach freezes exactly where the user is.)
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent("fom:overlay", { detail: { open: true } }));
    const y = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      window.scrollTo(0, y);
      window.dispatchEvent(new CustomEvent("fom:overlay", { detail: { open: false } }));
    };
  }, [open]);

  async function doSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
    <header style={{ viewTransitionName: "site-header" } as React.CSSProperties} className="sticky top-0 z-50 w-full border-b border-maple/10 bg-cream/80 shadow-[0_1px_24px_-16px_rgba(156,52,21,0.5)] backdrop-blur-md">
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

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 sm:gap-1.5 md:flex">
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
              onClick={doSignOut}
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

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-coral transition active:scale-90 md:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </nav>
    </header>

    {/* Mobile drawer — rendered OUTSIDE the backdrop-blurred <header> so its
        fixed positioning is relative to the viewport (not the header) and its
        own opaque background isn't broken by an ancestor backdrop-filter. */}
    <MobileDrawer
      open={open}
      onClose={() => setOpen(false)}
      pathname={pathname}
      isActive={isActive}
      owner={owner}
      user={!!user}
      onSignOut={doSignOut}
    />
    </>
  );
}

function MobileDrawer({
  open,
  onClose,
  isActive,
  owner,
  user,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  isActive: (href: string) => boolean;
  owner: boolean;
  user: boolean;
  onSignOut: () => void;
}) {
  // The frosted blur ramps in lock-step with the open slide (CSS transition on
  // backdrop-filter, below) so the glass is fully frosted exactly as the panel
  // arrives — no jarring two-stage "blur jump" after it settles. Blur grows from
  // 0 as the panel decelerates, so the heavy work lands while it's near-still.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setSettled(true));
    return () => {
      cancelAnimationFrame(id);
      setSettled(false);
    };
  }, [open]);
  const items = [
    ...LINKS,
    ...(owner
      ? [
          { href: "/admin/messages", label: "Inbox", Icon: Mail },
          { href: "/admin", label: "Studio", Icon: Grid },
        ]
      : []),
  ];

  // Staggered reveal for the menu rows — a little dopamine on open.
  const listV = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
  };
  const rowV = {
    hidden: { opacity: 0, x: 28 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 400, damping: 30 },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-bark/50 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed right-0 top-0 z-[70] flex h-full w-[82%] max-w-xs flex-col overflow-hidden border-l border-white/40 bg-gradient-to-br from-cream/75 via-cream/65 to-peach/50 p-5 pt-5 shadow-[-24px_0_60px_-20px_rgba(156,52,21,0.5)] transform-gpu will-change-transform transition-[backdrop-filter] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${settled ? "backdrop-blur-xl" : "backdrop-blur-none"} md:hidden`}
          >
            {/* warm accent seam along the top edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-coral via-maple to-gold"
            />
            {/* soft autumn glow accents */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-coral/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber/25 blur-3xl"
            />
            {/* faint oversized autumn kanji watermark fills the lower void */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-4 right-2 select-none font-script text-[9rem] leading-none text-coral/[0.05]"
            >
              秋
            </span>

            {/* header — calligraphy + a vermilion hanko seal (落款) */}
            <div className="relative mb-6 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <motion.p
                  animate={{ y: [0, -3, 0], rotate: [0, -1.5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 font-script text-2xl italic text-maple/85"
                >
                  <span aria-hidden className="text-base not-italic text-coral">
                    ❦
                  </span>
                  月が綺麗
                </motion.p>
                <span
                  aria-hidden
                  className="mt-1.5 grid h-8 w-8 -rotate-6 place-items-center rounded-[6px] bg-coral-dark font-display text-base font-bold leading-none text-cream shadow-[0_4px_12px_-4px_rgba(156,52,21,0.65)] ring-2 ring-inset ring-cream/40"
                >
                  月
                </span>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.82 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/60 text-coral ring-1 ring-maple/15 shadow-sm transition-colors hover:bg-white"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </motion.button>
            </div>

            <p className="relative mb-2.5 ml-1.5 font-serif text-[11px] font-semibold uppercase tracking-[0.3em] text-maple/55">
              Explore
            </p>

            <motion.nav
              variants={listV}
              initial="hidden"
              animate="show"
              className="relative flex flex-col gap-1.5"
            >
              {items.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <motion.div
                    key={href}
                    variants={rowV}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`group relative flex min-h-[52px] items-center gap-3.5 overflow-hidden rounded-2xl px-3.5 text-base font-semibold transition ${
                        active
                          ? "text-white"
                          : "text-bark hover:bg-white/45 hover:text-coral hover:ring-1 hover:ring-maple/10"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="drawer-active"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-coral to-maple shadow-[0_12px_30px_-10px_rgba(227,83,54,0.85)]"
                        />
                      )}
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
                          active ? "bg-white/25 text-white" : "bg-white/55 text-coral ring-1 ring-maple/10"
                        }`}
                      >
                        <Icon />
                      </span>
                      {label}
                      <span
                        className={`ml-auto text-lg transition-all duration-300 ${
                          active
                            ? "translate-x-0 opacity-90"
                            : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  </motion.div>
                );
              })}

              {user && (
                <div
                  aria-hidden
                  className="my-1.5 ml-1.5 mr-2 h-px bg-gradient-to-r from-maple/30 via-maple/12 to-transparent"
                />
              )}
              {user && (
                <motion.div
                  variants={rowV}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-1"
                >
                  <button
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                    className="group flex min-h-[52px] w-full items-center gap-3.5 rounded-2xl px-3.5 text-base font-semibold text-bark/55 transition-colors hover:text-coral"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/50 text-coral ring-1 ring-maple/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <LogOut />
                    </span>
                    Log out
                  </button>
                </motion.div>
              )}
            </motion.nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative mt-auto flex flex-col gap-2 px-1.5 pb-1"
            >
              {/* seigaiha (青海波) — traditional Japanese wave crests */}
              <div
                aria-hidden
                className="h-5 w-full opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 100%, transparent 0 30%, rgba(227,83,54,0.30) 30% 37%, transparent 37% 50%, rgba(227,83,54,0.30) 50% 57%, transparent 57% 70%, rgba(227,83,54,0.30) 70% 77%, transparent 77%), radial-gradient(circle at 50% 100%, transparent 0 30%, rgba(182,67,42,0.24) 30% 37%, transparent 37% 50%, rgba(182,67,42,0.24) 50% 57%, transparent 57% 70%, rgba(182,67,42,0.24) 70% 77%, transparent 77%)",
                  backgroundSize: "40px 20px",
                  backgroundPosition: "0 0, 20px 10px",
                  backgroundRepeat: "repeat",
                }}
              />
              <p className="text-center font-display text-base font-semibold text-coral">
                Frames of Mind
              </p>
              <p className="text-center font-serif text-xs italic text-bark/45">
                a gift, in autumn words
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
