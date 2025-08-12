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

  // Ensure proper CSS handling
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },

  // Headers for proper CSS caching
  async headers() {
    return [
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
