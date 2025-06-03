import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Read directory contents
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>} Array of filenames
 */
export async function readdir(dir) {
  try {
    return await fs.readdir(dir);
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    throw error;
  }
}

/**
 * Read file contents
 * @param {string} file - File path
 * @returns {Promise<string>} File contents
 */
export async function readFile(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    throw error;
  }
}

/**
 * Write file contents
 * @param {string} file - File path
 * @param {string} content - File contents
 * @returns {Promise<void>}
 */
export async function writeFile(file, content) {
  try {
    await fs.writeFile(file, content, 'utf8');
  } catch (error) {
    console.error(`Error writing file ${file}:`, error);
    throw error;
  }
}

/**
 * Check if file exists
 * @param {string} file - File path
 * @returns {Promise<boolean>}
 */
export async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
} 