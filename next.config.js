/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'via.placeholder.com', 'placehold.co'],
  },
  // Убрали basePath и assetPrefix для деплоя в корень
  trailingSlash: false, // Меняем на false для более чистых URL
  output: 'standalone', // Оптимизация для продакшн-сборки
  env: {
    // Явно указываем, что используем переменные окружения
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'production'
  },
  // Отключаем статическую генерацию для API роутов
  experimental: {
    serverActions: true,
  },
  // Избегаем проблем с путями при сборке
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

module.exports = nextConfig