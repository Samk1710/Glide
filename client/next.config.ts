import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.APP_BASE_URL || "http://localhost:3000"],
    },
  },
};

export default nextConfig;
