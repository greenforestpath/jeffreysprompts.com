import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile workspace packages
  transpilePackages: ["@jeffreysprompts/core"],
  // Optimize for production
  poweredByHeader: false,
  // Strict mode for better debugging
  reactStrictMode: true,
  // Use webpack for builds (turbopack has issues)
  experimental: {},
};

export default nextConfig;
