import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function testRoles() {
  console.log('Available roles:', Object.values(UserRole));
}

testRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
