/**
 * Lightweight in-memory fixed-window rate limiter. Good enough for a single
 * small app instance; for a multi-instance deploy swap the Map for Redis/Upstash.
 */
type Hit = { count: number; reset: number };
const store = new Map<string, Hit>();

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || now > hit.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (hit.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.reset - now) / 1000) };
  }
  hit.count += 1;
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

// Occasionally evict expired keys so the Map can't grow unbounded.
let lastSweep = 0;
export function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of store) if (now > v.reset) store.delete(k);
}
