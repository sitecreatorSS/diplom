import { migrate, seed } from './index.js';

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Apply migrations
    console.log('Applying database migrations...');
    await migrate();
    
    // Seed the database with initial data
    console.log('Seeding database with initial data...');
    await seed();
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
