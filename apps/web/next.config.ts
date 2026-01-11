import type { NextConfig } from "next";

// Security headers for production
const isProd = process.env.NODE_ENV === "production";
const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";
const plausibleOrigin = (() => {
  try {
    return new URL(plausibleSrc).origin;
  } catch {
    return "https://plausible.io";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self'",
    "'unsafe-inline'",
    !isProd ? "'unsafe-eval'" : "",
    plausibleOrigin,
    "https://js.stripe.com",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    plausibleOrigin,
    "https://api.stripe.com",
    "https://*.supabase.co",
  ].join(" "),
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
  "block-all-mixed-content",
].join("; ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@jeffreysprompts/core"],
  // Optimize for production
  poweredByHeader: false,
  // Strict mode for better debugging
  reactStrictMode: true,
  // Turbopack config for monorepo - use relative path from apps/web
  turbopack: {
    root: "../..",
  },
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
