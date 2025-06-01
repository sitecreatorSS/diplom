import { PrismaClient } from '@prisma/client';

// Extend the PrismaClient type to include the sellerApplication model
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance
const prismaClient = new PrismaClient();

// Export the client with type assertion
export const prisma = prismaClient as PrismaClient & {
  $queryRaw: <T = any>(query: TemplateStringsArray | string, ...values: any[]) => Promise<T[]>;
};

// In development, set the global prisma instance to avoid multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;