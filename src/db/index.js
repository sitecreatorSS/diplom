import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

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
