import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "wunnwxpichdwudbbjylh.supabase.co";
  }
})();

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy — only in production so dev HMR/eval keeps working.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://loremflickr.com https://images.unsplash.com https://picsum.photos`,
  "worker-src 'self' blob:",
]
  .join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  images: {
    // Local dev networks with NAT64/DNS64 make the optimizer reject remote
    // hosts as "private IP" — skip optimization in dev, keep it in prod.
    unoptimized: !isProd,
    // Keep optimized derivatives cached ~31 days so repeat loads skip re-transcoding.
    minimumCacheTTL: 2678400,
    // AVIF first (smallest payloads), then WebP — less bandwidth per request.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
    viewTransition: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Ambient Lottie + its WASM runtime are static & content-stable — cache hard
      // (browser + CDN) so repeat visits never re-download or re-decode them.
      {
        source: "/dotlottie/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/lottifiles/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
