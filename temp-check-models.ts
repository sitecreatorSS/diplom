import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModels() {
  console.log('Available models in Prisma Client:');
  
  // Get all property names from prisma instance
  const allProps = [];
  let obj = prisma;
  do {
    allProps.push(...Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
  } while (obj);
  
  // Filter out non-model properties
  const models = allProps
    .filter(prop => !prop.startsWith('_') && prop[0] === prop[0].toLowerCase())
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .sort();
    
  console.log('Available models:', models);
  
  // Check if productImage exists
  console.log('productImage exists:', 'productImage' in prisma);
  console.log('productImages exists:', 'productImages' in prisma);
}

checkModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
