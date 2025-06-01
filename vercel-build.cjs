const { execSync } = require('child_process');

console.log('Running database migrations...');
try {
  // Apply database migrations
  execSync('npm run db:migrate', { stdio: 'inherit' });
  
  // Seed the database (only in production)
  if (process.env.NODE_ENV === 'production') {
    console.log('Seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });
  }
  
  // Build the Next.js application
  console.log('Building the application...');
  execSync('next build', { stdio: 'inherit' });
  
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
