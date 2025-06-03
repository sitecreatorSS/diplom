import { Pool, QueryResult } from 'pg';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
  position?: string;
}

async function migrate() {
  console.log('Starting database migration...\n');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1, // Ограничиваем количество соединений для миграций
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to database\n');

    // Создаем таблицу для отслеживания миграций, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Migrations table checked/created\n');

    // Получаем список уже примененных миграций
    const { rows: appliedMigrations } = await client.query<{ name: string }>(
      'SELECT name FROM migrations ORDER BY id;'
    );
    console.log('Applied migrations:', appliedMigrations.map(m => m.name), '\n');

    // Получаем список файлов миграций
    const migrationsDir = join(__dirname, 'migrations');
    console.log('Looking for migrations in:', migrationsDir, '\n');
    
    const files = await readdir(migrationsDir);
    console.log('Found files:', files, '\n');
    
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log('Found', migrationFiles.length, 'migration files:', migrationFiles, '\n');

    // Применяем каждую миграцию
    for (const file of migrationFiles) {
      if (appliedMigrations.some(m => m.name === file)) {
        console.log(`Migration ${file} already applied, skipping...\n`);
        continue;
      }

      console.log(`Applying migration: ${file}\n`);
      const filePath = join(migrationsDir, file);
      const sql = await readFile(filePath, 'utf-8');
      console.log(`Read migration file ${file}, size: ${sql.length} bytes\n`);

      try {
        console.log('Started transaction\n');
        await client.query('BEGIN');

        // Разбиваем SQL на отдельные команды
        const commands = sql
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => cmd.length > 0);

        // Выполняем каждую команду отдельно
        for (const cmd of commands) {
          try {
            await client.query(cmd);
          } catch (cmdError) {
            const error = cmdError as MigrationError;
            // Если это ошибка о том, что тип уже существует, игнорируем её
            if (error.code === '42710' && error.message?.includes('already exists')) {
              console.log(`Warning: ${error.message}, continuing...\n`);
              continue;
            }
            throw error;
          }
        }

        // Записываем информацию о примененной миграции
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );

        await client.query('COMMIT');
        console.log(`Successfully applied migration: ${file}\n`);
      } catch (error) {
        await client.query('ROLLBACK');
        const migrationError = error as MigrationError;
        console.error(`Error applying migration ${file}:`, {
          message: migrationError.message,
          code: migrationError.code,
          detail: migrationError.detail,
          hint: migrationError.hint,
          position: migrationError.position,
          stack: migrationError.stack
        }, '\n');
        throw error;
      }
    }

    console.log('All migrations completed successfully\n');
  } catch (error) {
    const migrationError = error as MigrationError;
    console.error('Migration failed:', {
      message: migrationError.message,
      code: migrationError.code,
      detail: migrationError.detail,
      hint: migrationError.hint,
      position: migrationError.position,
      stack: migrationError.stack
    }, '\n');
    throw error;
  } finally {
    if (client) {
      console.log('Released database client\n');
      client.release();
    }
    console.log('Closed database pool\n');
    await pool.end();
  }
}

// Запускаем миграцию
migrate().catch(error => {
  console.error('Migration script failed:', error, '\n');
  process.exit(1);
});
