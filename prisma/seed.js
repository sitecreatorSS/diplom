const { execSync } = require('child_process');
const path = require('path');

const runSeed = async () => {
  console.log('🚀 Starting database seed...');
  console.log('📂 Current directory:', process.cwd());

  try {
    // Ensure TypeScript is installed
    console.log('🔧 Ensuring TypeScript is installed...');
    execSync('npm install typescript ts-node @types/node --save-dev', { stdio: 'inherit' });

    // Run the TypeScript seed file
    console.log('🌱 Running TypeScript seed...');
    const seedPath = path.join(__dirname, 'seed.ts');
    execSync(`npx ts-node --transpile-only ${seedPath}`, { stdio: 'inherit' });
    
    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error running seed:', error);
    process.exit(1);
  }

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
