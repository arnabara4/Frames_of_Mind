"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

/** Shows the LOG-IN pill for guests, or a WELCOME banner for the owner. */
export default function HomeGreeting() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-20" />;

  if (user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <h2 className="font-display text-4xl font-bold text-coral md:text-5xl">
          WELCOME ARNAB
        </h2>
        <Link
          href="/blogs/new"
          className="rounded-full bg-coral px-8 py-3 text-white transition hover:bg-coral-dark"
        >
          Write a new blog
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-xl border-2 border-coral px-12 py-3 text-lg font-medium text-coral transition hover:bg-coral hover:text-white"
    >
      LOG-IN
    </Link>
  );
}
