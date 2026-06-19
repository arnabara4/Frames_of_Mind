"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps every route so navigations cross-fade in. A `template` re-mounts on each
 * navigation (unlike `layout`), giving a seamless entry transition. We animate
 * opacity only — never transform — so it can't create a containing block that
 * would break the sticky editor action bars or navbar.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
