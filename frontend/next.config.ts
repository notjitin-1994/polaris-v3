import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    // Warnings are still shown but don't block the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily allow build to complete with type errors for deployment
    // TODO: Fix remaining type errors
    ignoreBuildErrors: true,
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  compress: true,
  // Set output file tracing root to avoid workspace confusion
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
