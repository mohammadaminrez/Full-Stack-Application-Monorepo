/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // API rewrites to backend (for local development only)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    // Only use rewrites for localhost (development)
    // For production with external URLs, the API client uses the full URL directly
    if (apiUrl.includes('localhost') || apiUrl.startsWith('http://localhost')) {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ];
    }
    
    // For production, no rewrites needed - API client uses full URL
    return [];
  },
};

module.exports = nextConfig;
