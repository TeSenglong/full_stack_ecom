import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
    },
  ],
},
};

export default nextConfig;
