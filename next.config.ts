import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increase the default 1 MB limit so PDFs can be uploaded via Server Actions
      bodySizeLimit: "16mb", // e.g., "10mb", "16mb", "25mb"
    },
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ let the build pass even if lint errors exist
  },
};

export default nextConfig;