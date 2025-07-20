import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境での静的最適化設定
  output: 'standalone',
  
  // 環境変数の検証
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

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
          maxSize: 244000, // 244KB max chunk size
          cacheGroups: {
            default: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true,
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
              priority: 5,
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

  // アセット最適化
  images: {
    domains: ['ipovokidhyhojjqhanwj.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },

  // パフォーマンス設定
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;