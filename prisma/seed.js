const { execSync } = require('child_process');

const runSeed = async () => {
  console.log('Running database seed...');
  try {
    // Выполняем сид через ts-node
    execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Failed to run seed:', error);
    process.exit(1);
  }
};

runSeed();
