/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'githubusercontent.com',
      },
      // Добавь другие домены, если используешь их для картинок
    ],
  },
};

export default nextConfig; 