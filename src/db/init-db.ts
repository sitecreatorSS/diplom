import { migrate } from './migrate.js';
import { seed } from './seed.js';

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Применяем миграции
    console.log('Applying database migrations...');
    await migrate();
    
    // Заполняем базу начальными данными
    console.log('Seeding database with initial data...');
    await seed();
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Запускаем инициализацию, если файл вызван напрямую
if (require.main === module) {
  initializeDatabase();
}
