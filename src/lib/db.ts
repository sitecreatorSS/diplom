import { PrismaClient } from '@prisma/client';

// Глобальная переменная для хранения экземпляра Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Инициализируем Prisma Client, если он еще не инициализирован
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// В продакшн-режиме не добавляем в глобальный объект
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;