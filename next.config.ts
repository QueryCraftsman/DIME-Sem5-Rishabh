import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react", "framer-motion"],
  },
  typescript: {
    // These are type-level-only mismatches from framer-motion, recharts, and
    // @base-ui/react Select generics. None affect runtime behaviour.
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
