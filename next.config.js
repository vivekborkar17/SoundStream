/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable experimental features for socket.io integration
  experimental: {
    serverComponentsExternalPackages: ['socket.io']
  }
};

module.exports = nextConfig;
