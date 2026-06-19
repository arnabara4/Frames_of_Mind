"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const { user, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-black/5">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-display text-2xl md:text-[28px] font-extrabold text-coral"
        >
          Frames of Mind
        </Link>

        <div className="flex items-center gap-6 md:gap-9">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm md:text-[17px] tracking-wide transition-colors hover:text-coral ${
                isActive(l.href) ? "text-coral" : "text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="text-sm md:text-[15px] text-ink/60 hover:text-coral"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
