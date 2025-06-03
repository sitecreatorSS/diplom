import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { env } from '../lib/env.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a connection pool to the database
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000, // время простоя перед закрытием соединения
  connectionTimeoutMillis: 2000, // таймаут на установку соединения
});

// Проверяем подключение к базе данных
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

// Логируем информацию о подключении (только в режиме разработки)
if (env.NODE_ENV !== 'production') {
  const dbUrl = new URL(env.DATABASE_URL);
  console.log('Connecting to database:', {
    host: dbUrl.hostname,
    user: dbUrl.username,
    database: dbUrl.pathname.replace(/^\//, ''),
    port: dbUrl.port,
    ssl: env.NODE_ENV === 'production' ? 'enabled' : 'disabled'
  });
}

/**
 * Execute a query with type safety
 * @template T
 * @param {string} text - SQL query text
 * @param {any[]} [params] - Query parameters
 * @returns {Promise<pg.QueryResult<T>>}
 */
async function query(text, params) {
  const client = await pool.connect();
  try {
    console.log('Executing query:', { text, params });
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Error executing query:', {
      error: error.message,
      code: error.code,
      query: text,
      params
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction
 * @param {Array<{text: string, params?: any[]}>} queries - Array of queries to execute
 * @returns {Promise<pg.QueryResult[]>}
 */
async function transaction(queries) {
  const client = await pool.connect();
  try {
    console.log('Starting transaction with queries:', queries.length);
    await client.query('BEGIN');
    
    const results = [];
    for (const q of queries) {
      console.log('Executing transaction query:', { text: q.text, params: q.params });
      const res = await client.query(q.text, q.params || []);
      results.push(res);
    }
    
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    return results;
  } catch (error) {
    console.error('Transaction failed:', {
      error: error.message,
      code: error.code,
      queries: queries.map(q => ({ text: q.text, params: q.params }))
    });
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { pool, query, transaction };
