import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from './config.js';
import { loadYamlFile } from './utils/yamlParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DAILY_TASK_FILE = path.join(__dirname, '../store/daily-task.json');

/**
 * 获取当前日期的每日任务
 * @returns {Object} 每日任务数据
 */
export function getDailyTask() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否存在今天的任务
    if (fs.existsSync(DAILY_TASK_FILE)) {
      const taskData = JSON.parse(fs.readFileSync(DAILY_TASK_FILE, 'utf8'));
      
      // 如果是今天的任务，直接返回
      if (taskData.date === today) {
        return taskData;
      }
    }
    
    // 生成新的每日任务
    return generateDailyTask();
  } catch (error) {
    console.error('获取每日任务失败:', error);
    throw new Error(`获取每日任务失败: ${error.message}`);
  }
}

/**
 * 生成新的每日任务
 * @returns {Object} 新生成的任务
 */
async function generateDailyTask() {
  try {
    const config = getConfig();
    const today = new Date().toISOString().split('T')[0];
    const library = config.defaultLibrary || 'cet4';
    const dailyGoal = config.dailyGoal || 20;
    
    // 加载词库
    const dataDir = path.join(__dirname, '../data', library);
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    
    let allWords = [];
    for (const file of files) {
      const words = await loadYamlFile(path.join(dataDir, file));
      allWords = [...allWords, ...words];
    }
    
    // 随机选择单词
    const selectedWords = [];
    const wordCount = Math.min(dailyGoal, allWords.length);
    
    // 简单随机选择算法
    const indices = new Set();
    while (indices.size < wordCount) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      indices.add(randomIndex);
    }
    
    // 构建任务列表
    for (const index of indices) {
      selectedWords.push({
        ...allWords[index],
        status: 'pending', // pending, completed, wrong
        reviewDate: today
      });
    }
    
    // 保存任务
    const taskData = {
      date: today,
      library,
      words: selectedWords,
      progress: {
        completed: 0,
        wrong: 0,
        total: selectedWords.length
      }
    };
    
    fs.writeFileSync(DAILY_TASK_FILE, JSON.stringify(taskData, null, 2), 'utf8');
    return taskData;
  } catch (error) {
    console.error('生成每日任务失败:', error);
    throw new Error(`生成每日任务失败: ${error.message}`);
  }
}

/**
 * 更新任务进度
 * @param {string} wordId - 单词ID或文本
 * @param {string} status - 新状态 (completed/wrong)
 * @returns {Object} 更新后的任务
 */
export function updateTaskProgress(wordId, status) {
  try {
    if (!fs.existsSync(DAILY_TASK_FILE)) {
      throw new Error('每日任务不存在');
    }
    
    const taskData = JSON.parse(fs.readFileSync(DAILY_TASK_FILE, 'utf8'));
    const wordIndex = taskData.words.findIndex(w => w.word === wordId);
    
    if (wordIndex === -1) {
      throw new Error('单词不在任务列表中');
    }
    
    // 更新单词状态
    const oldStatus = taskData.words[wordIndex].status;
    taskData.words[wordIndex].status = status;
    
    // 更新进度统计
    if (oldStatus === 'completed') taskData.progress.completed -= 1;
    if (oldStatus === 'wrong') taskData.progress.wrong -= 1;
    
    if (status === 'completed') taskData.progress.completed += 1;
    if (status === 'wrong') taskData.progress.wrong += 1;
    
    // 保存更新
    fs.writeFileSync(DAILY_TASK_FILE, JSON.stringify(taskData, null, 2), 'utf8');
    return taskData;
  } catch (error) {
    console.error('更新任务进度失败:', error);
    throw new Error(`更新任务进度失败: ${error.message}`);
  }
}
