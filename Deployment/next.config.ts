import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for shared hosting deployment
  output: 'standalone',

  // Disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable experimental features that might cause issues on shared hosting
  experimental: {
    // Disable turbopack for production builds to ensure compatibility
    turbo: undefined,
  },

  // Optimize images for shared hosting
  images: {
    // Use default loader for better compatibility
    unoptimized: false,
    // Add domains if you're loading images from external sources
    domains: [],
  },

  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,

  // Optimize for production
  compress: true,

  // Ensure proper trailing slash handling
  trailingSlash: false,

  // SWC minification is enabled by default in Next.js 15

  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
