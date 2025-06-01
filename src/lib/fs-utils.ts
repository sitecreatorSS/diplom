import { promises as fs, constants } from 'fs';
import path from 'path';

type FileSystemError = NodeJS.ErrnoException;

export async function readdir(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (error: unknown) {
    const err = error as FileSystemError;
    if (err.code === 'ENOENT') {
      // Директория не существует, возвращаем пустой массив
      return [];
    }
    throw error;
  }
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, constants.F_OK);
    return true;
  } catch (error: unknown) {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: unknown) {
    const err = error as FileSystemError;
    if (err.code !== 'EEXIST') {
      throw error;
    }
  }
}
