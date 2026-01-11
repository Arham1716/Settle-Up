import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // regular config here
  reactStrictMode: true,
  experimental: {
    turbopack: {
      root: "./", // frontend folder is the root
    },
  } as any, // <-- cast to any to avoid TypeScript error
};

export default nextConfig;
