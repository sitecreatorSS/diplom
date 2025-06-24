/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Если используешь другие внешние источники картинок, добавь их сюда
      {
        protocol: 'https',
        hostname: 'shop5-production.up.railway.app',
      },
    ],
  },
};

export default nextConfig; 