import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Создаем таблицу для отслеживания миграций, если она не существует
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Получаем список уже примененных миграций
    const { rows: appliedMigrations } = await pool.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id;'
    );
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));

    // Получаем список файлов миграций
    const migrationsDir = join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Применяем каждую миграцию
    for (const file of migrationFiles) {
      if (appliedMigrationNames.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);
      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');

      // Начинаем транзакцию
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Выполняем миграцию
        await client.query(sql);
        
        // Записываем информацию о примененной миграции
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        
        await client.query('COMMIT');
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запускаем миграцию
migrate().catch(error => {
  console.error('Migration script failed:', error);
  process.exit(1);
});
