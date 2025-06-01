import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из .env.local и .env в режиме разработки
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Экспортируем все переменные окружения
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Проверяем обязательные переменные окружения
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !env[varName]);

if (missingVars.length > 0) {
  console.error('Отсутствуют обязательные переменные окружения:', missingVars.join(', '));
  process.exit(1);
}

export default env;
