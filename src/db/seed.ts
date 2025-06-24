import bcrypt from 'bcryptjs';
import { query } from './index.js';
import { QueryResult } from 'pg';

interface UserRow {
  id: string | number;
}

interface CategoryRow {
  id: string | number;
}

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
      
      let adminId: string | number;
      const existingAdmins = await query<UserRow>(
        'SELECT id FROM users WHERE email = $1',
        [adminEmail]
      );

      if (existingAdmins.rows.length === 0) {
        console.log('Creating admin user...');
        await query(
          `INSERT INTO "User" (email, password, role, name, created_at, updated_at) 
           VALUES ($1, $2, 'ADMIN', 'Admin', NOW(), NOW())`,
          [adminEmail, adminPassword]
        );
        console.log('Admin user created successfully!');
        // Получаем id только что созданного пользователя
        const newAdmin = await query<UserRow>(
          'SELECT id FROM users WHERE email = $1',
          [adminEmail]
        );
        adminId = newAdmin.rows[0].id;
      } else {
        console.log('Admin user already exists, skipping...');
        adminId = existingAdmins.rows[0].id;
      }

      // 3. Добавляем тестовые категории, если их нет
      const { rows: existingCategories } = await query<CategoryRow>('SELECT id FROM "Category" LIMIT 1');
      
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

      // 4. Добавляем тестовые товары, если их нет
      const { rows: existingProducts } = await query<CategoryRow>('SELECT id FROM products LIMIT 1');

      if (existingProducts.length === 0) {
        console.log('Creating test products...');
        const products = [
          {
            name: 'Футболка', 
            description: 'Удобная хлопковая футболка', 
            price: 999.99, 
            category: 'Одежда', 
            stock: 50,
            image: '/placeholder-product.jpg',
            sellerId: adminId
          },
          {
            name: 'Джинсы', 
            description: 'Классические синие джинсы', 
            price: 2999.99, 
            category: 'Одежда', 
            stock: 30,
            image: '/placeholder-product.jpg',
            sellerId: adminId
          },
          {
            name: 'Кроссовки', 
            description: 'Стильные спортивные кроссовки', 
            price: 4999.99, 
            category: 'Обувь', 
            stock: 20,
            image: '/placeholder-product.jpg',
            sellerId: adminId
          }
        ];

        for (const product of products) {
          // Находим ID категории по названию
          const categoryRows = await query<CategoryRow>(
            'SELECT id FROM "Category" WHERE name = $1',
            [product.category]
          );
          const categoryId = categoryRows.rows[0]?.id || null;
          
          // Вставляем товар, используя ID категории
          await query(
            `INSERT INTO "Product" (name, description, price, category_id, stock, image, seller_id, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [product.name, product.description, product.price, categoryId, product.stock, product.image, product.sellerId]
          );
        }
        console.log('Test products created successfully!');
      } else {
        console.log('Test products already exist, skipping...');
      }

      // Фиксируем транзакцию
      await query('COMMIT');
      console.log('Database seeding completed successfully!');
    } catch (error) {
      // В случае ошибки откатываем транзакцию
      await query('ROLLBACK');
      console.error('Error during seeding:', error);
      throw error;
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

export { seed };
