import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Получаем текущую директорию в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Функция для создания пула соединений с поддержкой Neon
function createDbPool() {
  // Получаем URL базы данных
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
  
  if (!databaseUrl) {
    throw new Error('Не указан URL базы данных. Пожалуйста, установите переменную окружения DATABASE_URL или POSTGRES_URL_NON_POOLING');
  }

  // Парсим URL для Neon
  const url = new URL(databaseUrl);
  
  // Настройки для подключения
  const config: any = {
    host: url.hostname,
    port: url.port || 5432,
    database: url.pathname.replace(/^\//, ''),
    user: url.username,
    password: url.password,
    ssl: {
      rejectUnauthorized: false, // Требуется для Neon
    },
    // Увеличиваем таймауты для Neon
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10, // Максимальное количество соединений в пуле
  };

  return new Pool(config);
}

// Создаем пул соединений к базе данных
export const pool = createDbPool();

// Функция для выполнения SQL-запросов
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Функция для выполнения транзакций
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Функция для применения миграций
export const migrate = async () => {
  try {
    // Проверяем существование таблицы миграций
    await query(`
      CREATE TABLE IF NOT EXISTS "__migrations" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Получаем список уже примененных миграций
    const { rows: appliedMigrations } = await query(
      'SELECT name FROM "__migrations" ORDER BY name'
    );
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));

    // Получаем список доступных миграций
    const migrationsDir = join(__dirname, 'migrations');
    const migrationFiles = await import('fs/promises').then(fs => 
      fs.readdir(migrationsDir)
        .then(files => files
          .filter(file => file.endsWith('.sql'))
          .sort()
        )
    );

    // Применяем недостающие миграции
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.has(file)) {
        console.log(`Applying migration: ${file}`);
        const migrationSQL = readFileSync(join(migrationsDir, file), 'utf-8');
        
        // Выполняем миграцию в транзакции
        await transaction(async (client) => {
          await client.query(migrationSQL);
          await client.query(
            'INSERT INTO "__migrations" (name) VALUES ($1)', 
            [file]
          );
        });
        
        console.log(`Migration applied: ${file}`);
      }
    }
    
    console.log('All migrations are up to date');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Функция для заполнения базы тестовыми данными
export const seed = async () => {
  try {
    console.log('Seeding database...');
    
    // Проверяем, есть ли уже пользователи в базе
    const { rows: users } = await query('SELECT id FROM "User" LIMIT 1');
    
    if (users.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Создаем тестовых пользователей
    const { rows: [admin] } = await query(
      `INSERT INTO "User" (email, name, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email`,
      [
        'admin@example.com',
        'Admin User',
        await import('bcryptjs').then(bcrypt => bcrypt.hash('admin123', 10)),
        'ADMIN'
      ]
    );

    const { rows: [seller] } = await query(
      `INSERT INTO "User" (email, name, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email`,
      [
        'seller@example.com',
        'Seller User',
        await import('bcryptjs').then(bcrypt => bcrypt.hash('seller123', 10)),
        'SELLER'
      ]
    );

    const { rows: [buyer] } = await query(
      `INSERT INTO "User" (email, name, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email`,
      [
        'buyer@example.com',
        'Buyer User',
        await import('bcryptjs').then(bcrypt => bcrypt.hash('buyer123', 10)),
        'BUYER'
      ]
    );

    // Создаем категории
    const { rows: categories } = await query(
      `INSERT INTO "Category" (name, slug, description, is_featured)
       VALUES 
         ('Футболки', 't-shirts', 'Модные футболки', true),
         ('Джинсы', 'jeans', 'Классические и современные джинсы', true),
         ('Обувь', 'shoes', 'Обувь на все случаи жизни', true),
         ('Аксессуары', 'accessories', 'Модные аксессуары', false)
       RETURNING id, name`
    );

    // Создаем теги
    await query(
      `INSERT INTO "Tag" (name, slug)
       VALUES 
         ('Новинка', 'new'),
         ('Популярное', 'popular'),
         ('Распродажа', 'sale'),
         ('Лимитированная серия', 'limited')`
    );

    // Создаем товары
    const { rows: products } = await query(
      `INSERT INTO "Product" 
         (name, description, price, category_id, stock, seller_id, is_featured, rating, review_count)
       VALUES 
         ($1, $2, $3, $4, 100, $5, true, 4.5, 10),
         ($6, $7, $8, $9, 50, $5, true, 4.2, 8),
         ($10, $11, $12, $13, 75, $5, false, 4.0, 5)
       RETURNING id, name`,
      [
        'Футболка оверсайз',
        'Модная оверсайз футболка из хлопка',
        1999,
        categories[0].id,
        seller.id,
        'Джинсы скинни',
        'Удобные скинни джинсы',
        4999,
        categories[1].id,
        'Кроссовки классические',
        'Удобные кроссовки на каждый день',
        7999,
        categories[2].id
      ]
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
};

// Экспортируем типы для TypeScript
export type QueryResult<T> = {
  rows: T[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
};

export type QueryConfig = {
  text: string;
  values?: any[];
  name?: string;
};
