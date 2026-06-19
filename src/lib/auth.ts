import type { User } from "@supabase/supabase-js";

/** The single account allowed to write content. Mirrors public.is_owner() in SQL. */
export const OWNER_EMAIL =
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "owner@framesofmind.app";

export function isOwner(user: User | null | undefined): boolean {
  return !!user?.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/** Routes that require the owner. */
export const PROTECTED_PREFIXES = ["/blogs/new", "/admin"];

export function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // /blogs/<id>/edit
  return /^\/blogs\/[^/]+\/edit\/?$/.test(pathname);
}
