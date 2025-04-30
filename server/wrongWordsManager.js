import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WRONG_WORDS_FILE = path.join(__dirname, '../store/wrong-words.json');

/**
 * 获取错词本数据
 * @returns {Array} 错词列表
 */
export function getWrongWords() {
  try {
    if (!fs.existsSync(WRONG_WORDS_FILE)) {
      fs.writeFileSync(WRONG_WORDS_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    
    const data = fs.readFileSync(WRONG_WORDS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('获取错词本失败:', error);
    return [];
  }
}

/**
 * 添加单词到错词本
 * @param {Object} word - 单词对象
 */
export function addWrongWord(word) {
  try {
    const wrongWords = getWrongWords();
    const existingIndex = wrongWords.findIndex(w => w.word === word.word);
    
    if (existingIndex >= 0) {
      // 如果单词已存在，增加尝试次数
      wrongWords[existingIndex].attempts += 1;
      wrongWords[existingIndex].lastWrongDate = new Date().toISOString().split('T')[0];
    } else {
      // 添加新单词
      wrongWords.push({
        word: word.word,
        attempts: 1,
        lastWrongDate: new Date().toISOString().split('T')[0],
        fromLibrary: word.level || 'unknown'
      });
    }
    
    fs.writeFileSync(WRONG_WORDS_FILE, JSON.stringify(wrongWords, null, 2), 'utf8');
  } catch (error) {
    console.error('添加错词失败:', error);
    throw new Error(`添加错词失败: ${error.message}`);
  }
}

/**
 * 从错词本移除单词
 * @param {string} wordText - 要移除的单词
 */
export function removeWrongWord(wordText) {
  try {
    let wrongWords = getWrongWords();
    wrongWords = wrongWords.filter(w => w.word !== wordText);
    fs.writeFileSync(WRONG_WORDS_FILE, JSON.stringify(wrongWords, null, 2), 'utf8');
  } catch (error) {
    console.error('移除错词失败:', error);
    throw new Error(`移除错词失败: ${error.message}`);
  }
}

/**
 * 获取错词统计信息
 * @returns {Object} 统计信息
 */
export function getWrongWordsStats() {
  const wrongWords = getWrongWords();
  
  return {
    total: wrongWords.length,
    byLibrary: wrongWords.reduce((acc, word) => {
      const library = word.fromLibrary || 'unknown';
      acc[library] = (acc[library] || 0) + 1;
      return acc;
    }, {})
  };
}
