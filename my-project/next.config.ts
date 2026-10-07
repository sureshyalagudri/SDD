import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // Inlines the small global stylesheet into each page, removing a render-blocking round-trip.
  experimental: { inlineCss: true },
};

export default nextConfig;
