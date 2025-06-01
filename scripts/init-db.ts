import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

async function initDb() {
  // Проверяем существование SQL-файлов
  const initSqlPath = path.join(__dirname, 'init_sqlite.sql');
  const seedSqlPath = path.join(__dirname, 'seed.sql');

  if (!fs.existsSync(initSqlPath)) {
    throw new Error(`Файл ${initSqlPath} не найден`);
  }
  if (!fs.existsSync(seedSqlPath)) {
    throw new Error(`Файл ${seedSqlPath} не найден`);
  }

  // Создаем директорию для базы данных, если она не существует
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Открываем соединение с базой данных
  const db = await open({
    filename: path.join(dbDir, 'dev.sqlite'),
    driver: sqlite3.Database
  });

  try {
    // Читаем и выполняем SQL-скрипт создания таблиц
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await db.exec(initSql);

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Читаем SQL-скрипт с тестовыми данными
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    
    // Заменяем плейсхолдер пароля на хешированный пароль
    const seedSqlWithHashedPassword = seedSql.replace(
      '$2b$10$YourHashedPasswordHere',
      hashedPassword
    );

    // Выполняем SQL-скрипт с тестовыми данными
    await db.exec(seedSqlWithHashedPassword);

    console.log('База данных успешно инициализирована');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Запускаем инициализацию
initDb().catch(console.error); 