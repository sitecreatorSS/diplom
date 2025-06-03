import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './index.js';
import type { QueryResult } from 'pg';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface MigrationError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
  position?: string;
}

async function migrate() {
  let client;
  try {
    console.log('Starting database migration...');
    
    // Проверяем подключение к базе данных
    client = await pool.connect();
    console.log('Successfully connected to database');
    
    // Создаем таблицу для отслеживания миграций, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Migrations table checked/created');

    // Получаем список уже примененных миграций
    const { rows: appliedMigrations } = await client.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id;'
    );
    const appliedMigrationNames = new Set(appliedMigrations.map(m => m.name));
    console.log('Applied migrations:', Array.from(appliedMigrationNames));

    // Получаем список файлов миграций
    const migrationsDir = join(__dirname, 'migrations');
    console.log('Looking for migrations in:', migrationsDir);
    
    const files = await readdir(migrationsDir);
    console.log('Found files:', files);
    
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:`, migrationFiles);

    // Применяем каждую миграцию
    for (const file of migrationFiles) {
      if (appliedMigrationNames.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);
      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');
      console.log(`Read migration file ${file}, size: ${sql.length} bytes`);

      try {
        await client.query('BEGIN');
        console.log('Started transaction');
        
        // Выполняем миграцию
        await client.query(sql);
        console.log('Executed migration SQL');
        
        // Записываем информацию о примененной миграции
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        console.log('Recorded migration in migrations table');
        
        await client.query('COMMIT');
        console.log(`Successfully applied migration: ${file}`);
      } catch (error) {
        const migrationError = error as MigrationError;
        console.error(`Error applying migration ${file}:`, {
          message: migrationError.message,
          code: migrationError.code,
          detail: migrationError.detail,
          hint: migrationError.hint,
          position: migrationError.position,
          stack: migrationError.stack
        });
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log('Database migration completed successfully');
  } catch (error) {
    const migrationError = error as MigrationError;
    console.error('Migration failed:', {
      message: migrationError.message,
      code: migrationError.code,
      detail: migrationError.detail,
      hint: migrationError.hint,
      position: migrationError.position,
      stack: migrationError.stack
    });
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('Released database client');
    }
    await pool.end();
    console.log('Closed database pool');
  }
}

// Запускаем миграцию
migrate().catch(error => {
  const migrationError = error as MigrationError;
  console.error('Migration script failed:', {
    message: migrationError.message,
    code: migrationError.code,
    detail: migrationError.detail,
    hint: migrationError.hint,
    position: migrationError.position,
    stack: migrationError.stack
  });
  process.exit(1);
});
