import { Pool, QueryResult, QueryResultRow } from 'pg';

// Создаем пул соединений с базой данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Тип для параметров запроса
type QueryParams = any[];

// Интерфейс для результата запроса
export interface QueryResultExtended<T = any> extends Omit<QueryResult, 'rows'> {
  rows: T[];
}

// Функция для выполнения запросов
export const query = async <T = any>(
  text: string, 
  params: QueryParams = []
): Promise<QueryResultExtended<T>> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result as QueryResultExtended<T>;
  } finally {
    client.release();
  }
};

// Интерфейс для запроса в транзакции
interface TransactionQuery {
  text: string;
  params?: QueryParams;
}

// Функция для выполнения транзакций
export const transaction = async <T = any>(
  queries: TransactionQuery[]
): Promise<QueryResultExtended<T>[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results: QueryResultExtended<T>[] = [];
    
    for (const {text, params = []} of queries) {
      const result = await client.query(text, params);
      results.push(result as QueryResultExtended<T>);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

// Экспортируем pool для специальных случаев
export { pool };

export default {
  query,
  transaction,
  pool,
};