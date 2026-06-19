"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

/** A small Edit link shown only to the owner. */
export default function OwnerEditLink({
  href,
  label = "Edit",
}: {
  href: string;
  label?: string;
}) {
  const { owner } = useAuth();
  if (!owner) return null;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-coral/40 bg-white/70 px-4 py-1.5 text-sm font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
    >
      ✎ {label}
    </Link>
  );
}
