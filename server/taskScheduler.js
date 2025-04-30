// server/taskScheduler.js
import fs from 'fs';
import path from 'path';
import { loadLibrary } from './fileLoader.js';

const CONFIG_PATH = path.resolve('./config.json');
const TASK_PATH = path.resolve('./store/daily-task.json');

/**
 * 读取 config.json 中的配置
 */
function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { dailyGoal: 20, defaultLibrary: 'cet4' };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

/**
 * 读取当天缓存任务
 */
function readCachedTask() {
  if (!fs.existsSync(TASK_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(TASK_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 将任务写入 daily-task.json
 */
function writeTask(task) {
  fs.writeFileSync(TASK_PATH, JSON.stringify(task, null, 2), 'utf-8');
}

/**
 * 获取今日的单词任务（自动生成或读取缓存）
 */
export function getTodayTask() {
  const today = new Date().toISOString().split('T')[0];
  const config = readConfig();
  const cached = readCachedTask();

  if (cached?.date === today) return cached.words;

  // 生成新任务
  const allWords = loadLibrary(config.defaultLibrary);
  const sorted = allWords
    .filter(w => typeof w.mastery === 'number') // 有熟练度的优先
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0)); // 未掌握排前面

  const taskWords = sorted.slice(0, config.dailyGoal).map(w => w.word);

  const task = { date: today, words: taskWords };
  writeTask(task);

  return taskWords;
}
