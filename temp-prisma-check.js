const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModels() {
  console.log('Available models in Prisma Client:');
  console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && key[0] === key[0].toLowerCase()));
  
  console.log('productImage exists:', 'productImage' in prisma);
  console.log('productImages exists:', 'productImages' in prisma);
  
  // Check what's actually available
  console.log('All properties:', Object.getOwnPropertyNames(prisma));
}

checkModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
