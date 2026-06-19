import type { User } from "@supabase/supabase-js";

/** Accounts allowed to write content. Mirrors public.is_owner() in SQL. */
export const OWNER_EMAILS = (
  process.env.NEXT_PUBLIC_OWNER_EMAILS ??
  "pranavi@frame.com,pranavisinghal2007@gmail.com"
)
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
