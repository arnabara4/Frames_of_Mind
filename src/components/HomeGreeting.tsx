"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

const hover = { scale: 1.04 };
const tap = { scale: 0.96 };

/** Shows the LOG-IN pill for guests, or a WELCOME banner for the owner. */
export default function HomeGreeting() {
  const { owner, loading } = useAuth();

  // Guests see nothing here; only the owner gets the greeting + write CTA.
  if (loading || !owner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4"
    >
      <h2 className="font-display text-4xl font-bold text-coral md:text-5xl">
        WELCOME ARNAB
      </h2>
      <motion.div whileHover={hover} whileTap={tap}>
        <Link
          href="/blogs/new"
          className="inline-block rounded-full bg-coral px-8 py-3 text-white shadow-[var(--shadow-warm)] transition-colors hover:bg-coral-dark"
        >
          ✍ Write a new blog
        </Link>
      </motion.div>
    </motion.div>
  );
}
