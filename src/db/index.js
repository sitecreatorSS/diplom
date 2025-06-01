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

// Логируем информацию о подключении (только в режиме разработки)
if (env.NODE_ENV !== 'production') {
  console.log('Connecting to database:', {
    host: new URL(env.DATABASE_URL).hostname,
    user: new URL(env.DATABASE_URL).username,
    database: new URL(env.DATABASE_URL).pathname.replace(/^\//, '')
  });
}

// Execute a query
async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
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
    throw e;
  } finally {
    client.release();
  }
}

export { pool, query, transaction };
