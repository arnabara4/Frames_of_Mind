import { createHmac } from "crypto";

/**
 * The OTP *email + code verification* is delegated to Supabase Auth
 * (signInWithOtp / verifyOtp) — see the /api/otp routes. This module only mints
 * and checks the short-lived proof token that the contact endpoint requires
 * once an email has been verified, so the visitor never needs a real session.
 */
const SECRET = process.env.OTP_SECRET ?? "dev-insecure-otp-secret-change-me";
const TOKEN_TTL_MS = 15 * 60_000;

function norm(email: string) {
  return email.trim().toLowerCase();
}

/** Sign a proof-of-verification token for `email`, valid ~15 min. */
export function signToken(email: string): string {
  const e = norm(email);
  const exp = Date.now() + TOKEN_TTL_MS;
  const sig = createHmac("sha256", SECRET).update(`${e}:${exp}`).digest("hex");
  return Buffer.from(`${e}|${exp}|${sig}`).toString("base64url");
}

export function verifyToken(token: string, email: string): boolean {
  try {
    const [e, exp, sig] = Buffer.from(token, "base64url").toString().split("|");
    if (e !== norm(email)) return false;
    if (Date.now() > Number(exp)) return false;
    const good = createHmac("sha256", SECRET).update(`${e}:${exp}`).digest("hex");
    return good === sig;
  } catch {
    return false;
  }
}
