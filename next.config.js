// next.config.js - UPDATED FOR VERCEL DEPLOYMENT
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    // Remove any unstable_allowDynamic if present
  },
  // Webpack configuration for Prisma
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'canvas': 'commonjs canvas',
      'pg-native': 'commonjs pg-native'
    })
    return config
  },
  // Ensure proper handling of API routes
  async rewrites() {
    return []
  },
  // Performance optimizations for Vercel
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false
  },
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  // Output configuration for Vercel
  output: 'standalone'
}

module.exports = nextConfig
