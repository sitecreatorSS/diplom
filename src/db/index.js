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
    : false
});

// Проверяем подключение к базе данных
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Логируем информацию о подключении (только в режиме разработки)
if (env.NODE_ENV !== 'production') {
  console.log('Connecting to database:', {
    host: new URL(env.DATABASE_URL).hostname,
    user: new URL(env.DATABASE_URL).username,
    database: new URL(env.DATABASE_URL).pathname.replace(/^\//, '')
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
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute a transaction
async function transaction(queries) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const q of queries) {
      const res = await client.query(q.text, q.params || []);
      results.push(res);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', e);
    throw e;
  } finally {
    client.release();
  }
}

export { pool, query, transaction };
