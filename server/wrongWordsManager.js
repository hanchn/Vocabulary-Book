// server/wrongWordsManager.js
import fs from 'fs';
import path from 'path';

const WRONG_WORDS_PATH = path.resolve('./store/wrong-words.json');

/**
 * 加载错词本，如果不存在则返回空数组
 */
export function loadWrongWords() {
  if (!fs.existsSync(WRONG_WORDS_PATH)) return [];
  try {
    const raw = fs.readFileSync(WRONG_WORDS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('⚠️ 解析错词本失败:', err.message);
    return [];
  }
}

/**
 * 保存错词本数组到文件
 * @param {Array} words
 */
function saveWrongWords(words) {
  fs.writeFileSync(WRONG_WORDS_PATH, JSON.stringify(words, null, 2), 'utf-8');
}

/**
 * 添加或更新一个错词记录
 * @param {Object} entry - { word, fromLibrary, note? }
 */
export function addWrongWord(entry) {
  const words = loadWrongWords();
  const index = words.findIndex(w => w.word === entry.word);

  if (index !== -1) {
    words[index].attempts += 1;
    words[index].lastWrongDate = new Date().toISOString().split('T')[0];
    if (entry.note) words[index].note = entry.note;
  } else {
    words.push({
      word: entry.word,
      attempts: 1,
      lastWrongDate: new Date().toISOString().split('T')[0],
      fromLibrary: entry.fromLibrary,
      note: entry.note || ''
    });
  }

  saveWrongWords(words);
}

/**
 * 删除一个错词记录
 * @param {string} word 单词本身
 */
export function removeWrongWord(word) {
  const words = loadWrongWords();
  const newWords = words.filter(w => w.word !== word);
  saveWrongWords(newWords);
}
