import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './index.js';
import { env } from '../lib/env.js';
import { readdir, readFile } from '../lib/fs-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Starting migrations...');
  
  try {
    // Проверяем существование таблицы миграций
    await query(`
      CREATE TABLE IF NOT EXISTS "_migrations" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Получаем список выполненных миграций
    const { rows } = await query('SELECT name FROM "_migrations"');
    // Безопасно приводим тип, проверяя структуру данных
    const completedMigrations = (Array.isArray(rows) ? rows : []).flat().filter(
      (row): row is { name: string } => 
        typeof row === 'object' && 
        row !== null && 
        'name' in row && 
        typeof (row as { name: unknown }).name === 'string'
    );
    const completedMigrationNames = new Set(completedMigrations.map(m => m.name));

    // Получаем список файлов миграций
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter((file: string) => file.endsWith('.sql'))
      .sort();

    // Применяем новые миграции
    for (const fileName of migrationFiles) {
      if (!completedMigrationNames.has(fileName)) {
        console.log(`Applying migration: ${fileName}`);
        
        const migrationPath = path.join(migrationsDir, fileName);
        const migrationSQL = await readFile(migrationPath);
        
        // Начинаем транзакцию
        await query('BEGIN');
        
        try {
          // Выполняем SQL из файла миграции
          await query(migrationSQL);
          
          // Записываем выполненную миграцию
          await query('INSERT INTO "_migrations" (name) VALUES ($1)', [fileName]);
          
          // Фиксируем транзакцию
          await query('COMMIT');
          console.log(`✔ Successfully applied migration: ${fileName}`);
        } catch (error) {
          // В случае ошибки откатываем транзакцию
          await query('ROLLBACK');
          console.error(`✖ Failed to apply migration ${fileName}:`, error);
          throw error;
        }
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Если файл запущен напрямую, а не импортирован
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrate };
