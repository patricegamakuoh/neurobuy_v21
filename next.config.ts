import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack root inference warning by explicitly setting the root
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
