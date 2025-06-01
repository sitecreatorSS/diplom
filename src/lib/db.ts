import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'data', 'dev.sqlite'),
    driver: sqlite3.Database,
  });
}

export default openDb; 