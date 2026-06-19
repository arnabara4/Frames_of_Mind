"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export default function HomeGreeting() {
  const { owner, loading } = useAuth();
  const [hello, setHello] = useState("Welcome back");

  useEffect(() => {
    setHello(greetingWord());
  }, []);

  // Guests see nothing here; only the owner gets the greeting + write CTA.
  if (loading || !owner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-maple/15 bg-gradient-to-br from-peach/60 via-cream/70 to-salmon/40 p-8 text-center shadow-[var(--shadow-warm)] md:p-12"
    >
      {/* Floating leaf accents */}
      <motion.span
        aria-hidden
        className="absolute left-6 top-6 text-3xl"
        animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🍁
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute right-7 top-10 text-2xl"
        animate={{ y: [0, 8, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🍂
      </motion.span>

      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-maple/70">
        {hello}
      </p>

      <h2 className="mt-2 font-display text-4xl font-bold text-coral md:text-6xl">
        Pranavi
      </h2>

      <p className="mx-auto mt-3 max-w-md font-serif text-base italic leading-relaxed text-bark/75 md:text-lg">
        The page is yours — a quiet space to gather your thoughts like autumn
        leaves. What will you write today?
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/blogs/new"
            className="inline-flex items-center gap-2 rounded-full bg-coral px-8 py-3.5 font-display text-[17px] font-semibold tracking-wide text-white shadow-[var(--shadow-warm)] transition-colors hover:bg-coral-dark"
          >
            <span className="text-lg">✍</span> Write a new story
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-coral/40 bg-white/60 px-7 py-3.5 font-display text-[17px] font-semibold tracking-wide text-coral transition-colors hover:bg-white"
          >
            Open Studio →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
