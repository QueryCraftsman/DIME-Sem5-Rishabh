import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' blob: data: https: http:;
  font-src 'self' data: https:;
  connect-src 'self' https: http: ws: wss:;
  frame-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https:;
`.replace(/\s{2,}/g, " ").trim();

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
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = "cheap-module-source-map";
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
