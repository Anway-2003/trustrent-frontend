import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable standalone output for Docker
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost', 'trustrent.com'],
    // Disable image optimization in Docker for better compatibility
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
