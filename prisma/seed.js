const { execSync } = require('child_process');
const path = require('path');

const runSeed = async () => {
  console.log('Running database seed...');
  console.log('Current directory:', process.cwd());

  // Ensure TypeScript is installed
  console.log('Ensuring TypeScript is installed...');
  require('child_process').execSync('npm install typescript ts-node @types/node --save-dev', { stdio: 'inherit' });

  try {
    // Run TypeScript seed script using ts-node with proper paths
    const seedPath = path.join(__dirname, 'seed.ts');
    console.log(`Running seed script: ${seedPath}`);
    
    execSync(`npx ts-node --transpile-only ${seedPath}`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
        PRISMA_CLIENT_ENGINE_TYPE: 'binary'
      }
    });
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

runSeed();
