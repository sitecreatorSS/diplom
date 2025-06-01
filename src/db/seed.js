import { query } from './index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Check if users already exist
    const { rows: existingUsers } = await query('SELECT email FROM users LIMIT 1');
    
    if (existingUsers.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with initial data...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const buyerPassword = await bcrypt.hash('buyer123', 10);

    // Insert users
    const { rows: admin } = await query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['admin@example.com', adminPassword, 'Admin User', 'ADMIN']
    );

    const { rows: seller } = await query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['seller@example.com', sellerPassword, 'Seller User', 'SELLER']
    );

    const { rows: buyer } = await query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      ['buyer@example.com', buyerPassword, 'Buyer User', 'USER']
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Execute the seed function
seed();
