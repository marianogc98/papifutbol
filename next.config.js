/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Para Docker
  basePath: '/papifutbol',
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  // Para producción en VPS
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

