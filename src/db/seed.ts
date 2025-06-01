import bcrypt from 'bcryptjs';
import { query } from './index.js';
import { env } from '../lib/env.js';

async function seed() {
  console.log('Starting database seeding...');

  try {
    // Начинаем транзакцию
    await query('BEGIN');

    try {
      // 1. Создаем роли, если их нет
      await query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
            CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SELLER', 'BUYER');
          END IF;
        END
        $$;
      `);

      // 2. Создаем пользователя администратора, если его нет
      const adminEmail = 'admin@example.com';
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      const { rows: existingAdmins } = await query(
        'SELECT id FROM "User" WHERE email = $1',
        [adminEmail]
      );

      if (existingAdmins.length === 0) {
        console.log('Creating admin user...');
        await query(
          `INSERT INTO "User" (email, password, role, name, "emailVerified", created_at, updated_at) 
           VALUES ($1, $2, 'ADMIN', 'Admin', NOW(), NOW(), NOW())`,
          [adminEmail, adminPassword]
        );
        console.log('Admin user created successfully!');
      } else {
        console.log('Admin user already exists, skipping...');
      }

      // 3. Добавляем тестовые категории, если их нет
      const { rows: existingCategories } = await query('SELECT id FROM "Category" LIMIT 1');
      
      if (existingCategories.length === 0) {
        console.log('Creating categories...');
        const categories = [
          { name: 'Одежда', slug: 'clothing' },
          { name: 'Обувь', slug: 'shoes' },
          { name: 'Аксессуары', slug: 'accessories' },
        ];

        for (const category of categories) {
          await query(
            'INSERT INTO "Category" (name, slug, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
            [category.name, category.slug]
          );
        }
        console.log('Categories created successfully!');
      } else {
        console.log('Categories already exist, skipping...');
      }

      // Фиксируем транзакцию
      await query('COMMIT');
      console.log('Database seeding completed successfully!');
    } catch (error) {
      // В случае ошибки откатываем транзакцию
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Если файл запущен напрямую, а не импортирован
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export { seed };
