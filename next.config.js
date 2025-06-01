/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'via.placeholder.com', 'placehold.co'],
  },
  // Убрали basePath и assetPrefix для деплоя в корень
  trailingSlash: false, // Меняем на false для более чистых URL
  output: 'standalone', // Оптимизация для продакшн-сборки
}

module.exports = nextConfig