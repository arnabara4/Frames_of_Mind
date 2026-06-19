"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAuth } from "@/components/AuthProvider";

const LINKS = [
  { href: "/", label: "HOME" },
  { href: "/blogs", label: "BLOGS" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, owner, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-maple/10 bg-cream/85 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <DotLottieReact
            src="/lottifiles/october-go.lottie"
            loop
            autoplay
            aria-hidden
            className="h-11 w-11 shrink-0 md:h-12 md:w-12"
          />
          <span className="font-display text-2xl font-semibold text-coral md:text-[28px]">
            Frames of Mind
          </span>
        </Link>

        <div className="flex items-center gap-5 md:gap-8">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative py-1 text-sm tracking-wide transition-colors hover:text-coral md:text-[16px] ${
                  active ? "text-coral" : "text-bark"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-coral"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {owner && (
            <Link
              href="/admin"
              className={`hidden text-sm md:inline ${
                pathname.startsWith("/admin") ? "text-coral" : "text-bark/70"
              } transition-colors hover:text-coral`}
            >
              DASHBOARD
            </Link>
          )}

          {user && (
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="text-sm text-bark/50 transition-colors hover:text-coral"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
