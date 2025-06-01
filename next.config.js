/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'via.placeholder.com'],
  },
  basePath: '/Shop', // Repository name
  assetPrefix: '/Shop/', // Repository name
  trailingSlash: true,
}

module.exports = nextConfig