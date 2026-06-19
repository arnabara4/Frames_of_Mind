import type { User } from "@supabase/supabase-js";

/**
 * Server-only owner allow-list. Read from a non-public env var so the emails are
 * never bundled into client JS. The database `public.is_owner()` is the real
 * gate; this mirrors it for server-side route guards. Client code must use the
 * is_owner() RPC (see AuthProvider) instead of this.
 */
const OWNER_EMAILS = (process.env.OWNER_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isOwner(user: User | null | undefined): boolean {
  return !!user?.email && OWNER_EMAILS.includes(user.email.toLowerCase());
}

/** Routes that require the owner. */
export const PROTECTED_PREFIXES = ["/blogs/new", "/admin", "/about/edit"];

export function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // /blogs/<id>/edit
  return /^\/blogs\/[^/]+\/edit\/?$/.test(pathname);
}
