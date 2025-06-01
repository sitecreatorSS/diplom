import { seed as runSeed } from './index.js';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    await runSeed();
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
