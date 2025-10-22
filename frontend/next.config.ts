import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Enable hot reloading and dev features
    reactStrictMode: true,
  }),
};

export default nextConfig;
