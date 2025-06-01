import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile } from 'fs/promises';
import { query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    console.log('Starting migrations...');
    
    // Создаем таблицу для отслеживания миграций, если её нет
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Получаем список уже выполненных миграций
    const { rows: executedMigrations } = await query('SELECT name FROM migrations');
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

    // Получаем список файлов миграций
    const migrationsDir = join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Применяем каждую миграцию, если она еще не была применена
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Applying migration: ${file}`);
        
        const migrationPath = join(migrationsDir, file);
        const migrationSQL = await readFile(migrationPath, 'utf8');
        
        // Выполняем миграцию в транзакции
        await query('BEGIN');
        try {
          await query(migrationSQL);
          await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration ${file} already applied, skipping`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Экспортируем функцию миграции
export { migrate };

// Вызываем функцию миграции, если файл запущен напрямую
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().catch(console.error);
}
