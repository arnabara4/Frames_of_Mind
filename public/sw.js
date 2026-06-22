/* Frames of Mind — minimal, safe service worker.
   Network-first for navigations (fresh content, offline fallback to cache),
   stale-while-revalidate for static assets. Never caches /api or cross-origin
   (Supabase / auth) requests. */
const CACHE = "fom-v3";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add(OFFLINE_URL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip Supabase etc.
  if (url.pathname.startsWith("/api")) return; // never cache auth/contact/otp

  // App pages → network-first, fall back to cache when offline.
  if (request.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const net = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, net.clone());
          return net;
        } catch {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match(OFFLINE_URL)) ||
            (await cache.match("/")) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Static assets → stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/lottifiles/") ||
    url.pathname.startsWith("/dotlottie/") ||
    /\.(png|jpe?g|svg|webp|avif|woff2?|ico|css|js|wasm)$/.test(url.pathname);

  if (isStatic) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((r) => {
            if (r.ok) cache.put(request, r.clone());
            return r;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});
