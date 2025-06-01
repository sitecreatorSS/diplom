import { readFile } from 'fs/promises';
import { join } from 'path';
import { query } from './db';

export async function initDatabase() {
  try {
    // Читаем SQL-файл со схемой
    const schemaPath = join(process.cwd(), 'src/lib/schema.sql');
    const schemaSQL = await readFile(schemaPath, 'utf-8');
    
    // Выполняем SQL-скрипт
    await query(schemaSQL);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Если файл запущен напрямую, а не импортирован
if (require.main === module) {
  initDatabase().catch(console.error);
}
