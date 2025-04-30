// server/fileLoader.js
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DATA_ROOT = path.resolve('./data');

/**
 * 获取所有词库目录（如 kindergarten, cet4）
 * @returns {string[]} 词库名数组
 */
export function listLibraries() {
  if (!fs.existsSync(DATA_ROOT)) return [];

  return fs
    .readdirSync(DATA_ROOT, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * 获取指定词库下的所有 YAML 文件路径
 * @param {string} libraryName 词库名（如 'cet4'）
 * @returns {string[]} 文件名数组
 */
export function listLibraryFiles(libraryName) {
  const libraryPath = path.join(DATA_ROOT, libraryName);
  if (!fs.existsSync(libraryPath)) return [];

  return fs
    .readdirSync(libraryPath)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
}

/**
 * 读取某个词库的所有单词数据（合并所有 yaml 文件）
 * @param {string} libraryName
 * @returns {Array<Object>} 单词数组
 */
export function loadLibrary(libraryName) {
  const files = listLibraryFiles(libraryName);
  const fullPaths = files.map(file => path.join(DATA_ROOT, libraryName, file));

  const words = [];

  for (const filePath of fullPaths) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent);
      if (Array.isArray(data)) {
        words.push(...data);
      }
    } catch (err) {
      console.warn(`⚠️ 加载失败: ${filePath}`, err.message);
    }
  }

  return words;
}
