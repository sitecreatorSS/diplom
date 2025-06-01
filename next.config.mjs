/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  // Оптимизация изображений
  images: {
    domains: [
      'example.com',
      'via.placeholder.com',
      'placehold.co',
      'localhost',
      '127.0.0.1',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Для более чистых URL
  trailingSlash: false,
  
  // Оптимизация для продакшн-сборки
  output: 'standalone',
  
  // Переменные окружения, доступные на клиенте
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Настройки для TypeScript
  typescript: {
    // Включаем проверку типов при сборке
    ignoreBuildErrors: false,
  },

  // Настройки ESLint
  eslint: {
    // Запускаем ESLint во время сборки
    ignoreDuringBuilds: false,
  },

  // Настройки Webpack
  webpack: (config, { isServer }) => {
    // Добавляем алиасы для путей
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };

    // Игнорируем предупреждения о source maps
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch/ },
      { file: /node_modules\/swagger-client/ },
    ];

    // Игнорируем критические предупреждения
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/node-fetch/ },
      { file: /node_modules\/swagger-client/ },
    ];

    // Исправляем проблему с модулями fs и path
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },
};

export default nextConfig;