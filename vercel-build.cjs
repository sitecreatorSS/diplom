const { execSync } = require('child_process');
const { join } = require('path');
require('dotenv').config();

async function run() {
  try {
    console.log('Installing dependencies...');
    execSync('npm install', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    // Проверяем наличие переменных окружения
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET',
      'POSTGRES_URL_NON_POOLING'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars.join(', '));
      process.exit(1);
    }

    console.log('Running database migrations...');
    execSync(`node --experimental-modules --es-module-specifier-resolution=node ${join('src', 'db', 'migrate.js')}`, { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    console.log('Seeding database...');
    execSync(`node --experimental-modules --es-module-specifier-resolution=node ${join('src', 'db', 'seed.js')}`, { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    console.log('Building Next.js application...');
    execSync('npm run build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    console.log('Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

run();
