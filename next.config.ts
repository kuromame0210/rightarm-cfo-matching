import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration for stable builds
  webpack: (config, { dev, isServer }) => {
    // Fix for vendor chunk issues in production
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Conservative chunk splitting for stability
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }
    
    return config
  },

  // Conservative experimental settings
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;