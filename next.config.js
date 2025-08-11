/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Render
  output: 'standalone',

  // Optimize for production
  compress: true,

  // Enable image optimization
  images: {
    unoptimized: true,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
