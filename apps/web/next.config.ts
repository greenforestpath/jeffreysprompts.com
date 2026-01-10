import type { NextConfig } from "next";

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
};

export default nextConfig;
