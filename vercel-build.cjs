const { execSync, spawn } = require('child_process');
const { join } = require('path');
require('dotenv').config({ override: true });

console.log('DEBUG POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Installing dependencies...');
    execSync('npm install', { 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
      }
    });

    // Debug: Print all environment variables
    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING ? 'Set' : 'Not set');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Not set');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

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

    // Устанавливаем переменные окружения для дочерних процессов
    const env = {
      ...process.env,
      NODE_ENV: 'production',
    };

    console.log('Running database migrations...');
    try {
      // Запускаем миграции через spawn для лучшей обработки ошибок
      const migrateProcess = spawn('npx', ['tsx', 'src/db/migrate.ts'], {
        env,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      migrateProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output);
      });

      migrateProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(output);
      });

      await new Promise((resolve, reject) => {
        migrateProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Migration failed with code ${code}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
          }
        });
      });
    } catch (error) {
      console.error('Error running migrations:', {
        message: error.message,
        code: error.code,
        signal: error.signal,
        stdout: error.stdout?.toString(),
        stderr: error.stderr?.toString(),
        stack: error.stack
      });
      process.exit(1);
    }

    console.log('Seeding database...');
    try {
      // Запускаем сидинг через spawn для лучшей обработки ошибок
      const seedProcess = spawn('npx', ['tsx', 'src/db/seed.ts'], {
        env,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      seedProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log(output);
      });

      seedProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.error(output);
      });

      await new Promise((resolve, reject) => {
        seedProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Seeding failed with code ${code}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
          }
        });
      });
    } catch (error) {
      console.error('Error seeding database:', {
        message: error.message,
        code: error.code,
        signal: error.signal,
        stdout: error.stdout?.toString(),
        stderr: error.stderr?.toString(),
        stack: error.stack
      });
      // Продолжаем выполнение, даже если сидинг не удался
    }

    console.log('Building Next.js application...');
    execSync('npm run build', { 
      stdio: 'inherit',
      env
    });

    console.log('Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Build failed:', {
      message: error.message,
      code: error.code,
      signal: error.signal,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString(),
      stack: error.stack
    });
    process.exit(1);
  }
}

run();
