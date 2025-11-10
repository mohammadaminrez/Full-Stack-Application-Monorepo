/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // API rewrites to backend (for local development)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
