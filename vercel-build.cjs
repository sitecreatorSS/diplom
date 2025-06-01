const { execSync } = require('child_process');
const { join } = require('path');

async function run() {
  try {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('Running database migrations...');
    execSync(`node ${join('src', 'db', 'migrate.js')}`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--experimental-modules --es-module-specifier-resolution=node',
        NODE_ENV: 'production'
      }
    });

    console.log('Seeding database...');
    execSync(`node ${join('src', 'db', 'seed.js')}`, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--experimental-modules --es-module-specifier-resolution=node',
        NODE_ENV: 'production'
      }
    });

    console.log('Building Next.js application...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

run();
