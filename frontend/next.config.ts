import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js Image component to load from backend (if needed)
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
